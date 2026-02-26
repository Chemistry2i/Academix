package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.*;
import com.academix.server.repository.*;

@Service
@Transactional
public class EnrollmentService {

    private static final Logger logger = LoggerFactory.getLogger(EnrollmentService.class);

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private SubjectRepository subjectRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentSubjectRepository studentSubjectRepository;

    @Autowired
    private StudentCourseRepository studentCourseRepository;

    @Autowired
    private TeacherSubjectRepository teacherSubjectRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    // ============ STUDENT-SUBJECT ENROLLMENT ============

    /**
     * Enroll a student in a subject
     */
    public StudentSubject enrollStudentInSubject(Long studentId, Long subjectId, 
            Boolean isPrincipal, Boolean isSubsidiary, String academicYear, Integer term) {
        
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));

        // Check if already enrolled
        if (studentSubjectRepository.existsByStudentIdAndSubjectId(studentId, subjectId)) {
            throw new RuntimeException("Student is already enrolled in this subject");
        }

        StudentSubject enrollment = new StudentSubject();
        enrollment.setStudent(student);
        enrollment.setSubject(subject);
        enrollment.setIsPrincipal(isPrincipal != null ? isPrincipal : false);
        enrollment.setIsSubsidiary(isSubsidiary != null ? isSubsidiary : false);
        enrollment.setIsCompulsory(subject.getIsCompulsory());
        enrollment.setAcademicYear(academicYear);
        enrollment.setTerm(term);
        enrollment.setStatus(StudentSubject.EnrollmentStatus.ACTIVE);
        enrollment.setEnrolledAt(LocalDateTime.now());

        StudentSubject saved = studentSubjectRepository.save(enrollment);
        logger.info("Student {} enrolled in subject {}", student.getStudentId(), subject.getCode());
        return saved;
    }

    /**
     * Bulk enroll student in subjects
     */
    public List<StudentSubject> enrollStudentInSubjects(Long studentId, List<Long> subjectIds, 
            String academicYear, Integer term) {
        
        List<StudentSubject> enrollments = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long subjectId : subjectIds) {
            try {
                enrollments.add(enrollStudentInSubject(studentId, subjectId, false, false, academicYear, term));
            } catch (Exception e) {
                errors.add("Subject " + subjectId + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            logger.warn("Bulk enrollment had {} errors: {}", errors.size(), errors);
        }

        return enrollments;
    }

    /**
     * Drop a student from a subject
     */
    public StudentSubject dropStudentFromSubject(Long studentId, Long subjectId, String reason) {
        StudentSubject enrollment = studentSubjectRepository.findByStudentIdAndSubjectId(studentId, subjectId)
            .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setStatus(StudentSubject.EnrollmentStatus.DROPPED);
        enrollment.setDroppedAt(LocalDateTime.now());
        enrollment.setDropReason(reason);

        logger.info("Student {} dropped from subject {}", studentId, subjectId);
        return studentSubjectRepository.save(enrollment);
    }

    /**
     * Get subjects for a student
     */
    @Transactional(readOnly = true)
    public List<Subject> getStudentSubjects(Long studentId) {
        List<StudentSubject> enrollments = studentSubjectRepository.findActiveEnrollmentsWithSubject(studentId);
        return enrollments.stream()
            .map(StudentSubject::getSubject)
            .collect(Collectors.toList());
    }

    /**
     * Get students enrolled in a subject
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsInSubject(Long subjectId) {
        List<StudentSubject> enrollments = studentSubjectRepository.findStudentsEnrolledInSubject(subjectId);
        return enrollments.stream()
            .map(StudentSubject::getStudent)
            .collect(Collectors.toList());
    }

    // ============ STUDENT-COURSE ENROLLMENT ============

    /**
     * Enroll a student in a course (A-Level combination)
     */
    public StudentCourse enrollStudentInCourse(Long studentId, Long courseId, 
            String academicYear, String classLevel) {
        
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + studentId));

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        // Check if already enrolled in this course for this year
        if (studentCourseRepository.existsByStudentIdAndCourseIdAndAcademicYear(studentId, courseId, academicYear)) {
            throw new RuntimeException("Student is already enrolled in this course for this academic year");
        }

        // Check course capacity
        if (course.getMaxStudents() > 0 && course.getCurrentEnrollment() >= course.getMaxStudents()) {
            throw new RuntimeException("Course is at maximum capacity");
        }

        StudentCourse enrollment = new StudentCourse();
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setAcademicYear(academicYear);
        enrollment.setClassLevel(classLevel);
        enrollment.setStatus(StudentCourse.EnrollmentStatus.ACTIVE);
        enrollment.setEnrolledAt(LocalDateTime.now());

        // Update course enrollment count
        course.setCurrentEnrollment(course.getCurrentEnrollment() + 1);
        courseRepository.save(course);

        // Update student's combination field
        student.setCombination(course.getCode());
        studentRepository.save(student);

        // Auto-enroll in course subjects
        autoEnrollInCourseSubjects(student, course, academicYear);

        StudentCourse saved = studentCourseRepository.save(enrollment);
        logger.info("Student {} enrolled in course {}", student.getStudentId(), course.getCode());
        return saved;
    }

    /**
     * Auto-enroll student in course subjects
     */
    private void autoEnrollInCourseSubjects(Student student, Course course, String academicYear) {
        // Enroll in principal subjects
        for (String subjectCode : course.getPrincipalSubjects()) {
            try {
                Optional<Subject> subjectOpt = subjectRepository.findByCode(subjectCode);
                if (subjectOpt.isPresent()) {
                    enrollStudentInSubject(student.getId(), subjectOpt.get().getId(), true, false, academicYear, 1);
                }
            } catch (Exception e) {
                logger.warn("Failed to auto-enroll in subject {}: {}", subjectCode, e.getMessage());
            }
        }

        // Enroll in subsidiary subjects
        for (String subjectCode : course.getSubsidiarySubjects()) {
            try {
                Optional<Subject> subjectOpt = subjectRepository.findByCode(subjectCode);
                if (subjectOpt.isPresent()) {
                    enrollStudentInSubject(student.getId(), subjectOpt.get().getId(), false, true, academicYear, 1);
                }
            } catch (Exception e) {
                logger.warn("Failed to auto-enroll in subsidiary subject {}: {}", subjectCode, e.getMessage());
            }
        }
    }

    /**
     * Get course enrollment for a student
     */
    @Transactional(readOnly = true)
    public Optional<Course> getStudentCourse(Long studentId) {
        return studentCourseRepository.findActiveEnrollmentForStudent(studentId)
            .map(StudentCourse::getCourse);
    }

    /**
     * Get students in a course
     */
    @Transactional(readOnly = true)
    public List<Student> getStudentsInCourse(Long courseId) {
        List<StudentCourse> enrollments = studentCourseRepository.findActiveStudentsInCourse(courseId);
        return enrollments.stream()
            .map(StudentCourse::getStudent)
            .collect(Collectors.toList());
    }

    // ============ TEACHER-SUBJECT ASSIGNMENT ============

    /**
     * Assign a teacher to a subject
     */
    public TeacherSubject assignTeacherToSubject(Long teacherId, Long subjectId, 
            Boolean isPrimary, String assignedClasses, String academicYear) {
        
        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        Subject subject = subjectRepository.findById(subjectId)
            .orElseThrow(() -> new RuntimeException("Subject not found with id: " + subjectId));

        // Check if already assigned
        if (teacherSubjectRepository.existsByTeacherIdAndSubjectId(teacherId, subjectId)) {
            throw new RuntimeException("Teacher is already assigned to this subject");
        }

        TeacherSubject assignment = new TeacherSubject();
        assignment.setTeacher(teacher);
        assignment.setSubject(subject);
        assignment.setIsPrimary(isPrimary != null ? isPrimary : false);
        assignment.setAssignedClasses(assignedClasses);
        assignment.setAcademicYear(academicYear);
        assignment.setStatus(TeacherSubject.AssignmentStatus.ACTIVE);
        assignment.setAssignedAt(LocalDateTime.now());

        // Update teacher's subject list (legacy field)
        teacher.addSubject(subject.getCode());
        teacherRepository.save(teacher);

        TeacherSubject saved = teacherSubjectRepository.save(assignment);
        logger.info("Teacher {} assigned to subject {}", teacher.getTeacherId(), subject.getCode());
        return saved;
    }

    /**
     * Remove teacher from subject
     */
    public void removeTeacherFromSubject(Long teacherId, Long subjectId) {
        TeacherSubject assignment = teacherSubjectRepository.findByTeacherIdAndSubjectId(teacherId, subjectId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));

        assignment.setStatus(TeacherSubject.AssignmentStatus.INACTIVE);
        teacherSubjectRepository.save(assignment);

        // Update teacher's subject list
        Subject subject = assignment.getSubject();
        Teacher teacher = assignment.getTeacher();
        teacher.removeSubject(subject.getCode());
        teacherRepository.save(teacher);

        logger.info("Teacher {} removed from subject {}", teacherId, subjectId);
    }

    /**
     * Get subjects taught by a teacher
     */
    @Transactional(readOnly = true)
    public List<Subject> getTeacherSubjects(Long teacherId) {
        List<TeacherSubject> assignments = teacherSubjectRepository.findSubjectsTaughtByTeacher(teacherId);
        return assignments.stream()
            .map(TeacherSubject::getSubject)
            .collect(Collectors.toList());
    }

    /**
     * Get teachers for a subject
     */
    @Transactional(readOnly = true)
    public List<Teacher> getSubjectTeachers(Long subjectId) {
        List<TeacherSubject> assignments = teacherSubjectRepository.findTeachersForSubject(subjectId);
        return assignments.stream()
            .map(TeacherSubject::getTeacher)
            .collect(Collectors.toList());
    }

    // ============ STATISTICS ============

    /**
     * Get enrollment statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getEnrollmentStatistics() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalStudentSubjectEnrollments", studentSubjectRepository.count());
        stats.put("totalStudentCourseEnrollments", studentCourseRepository.count());
        stats.put("totalTeacherSubjectAssignments", teacherSubjectRepository.count());

        return stats;
    }

    /**
     * Get student enrollment summary
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentEnrollmentSummary(Long studentId) {
        Map<String, Object> summary = new HashMap<>();

        summary.put("studentId", studentId);
        summary.put("subjects", getStudentSubjects(studentId));
        summary.put("subjectCount", studentSubjectRepository.countByStudentIdAndStatus(
            studentId, StudentSubject.EnrollmentStatus.ACTIVE));
        
        Optional<Course> course = getStudentCourse(studentId);
        summary.put("course", course.orElse(null));

        return summary;
    }
}
