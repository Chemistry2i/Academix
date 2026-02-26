package com.academix.server.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Course;
import com.academix.server.model.SchoolClass;
import com.academix.server.model.Teacher;
import com.academix.server.repository.CourseRepository;
import com.academix.server.repository.SchoolClassRepository;
import com.academix.server.repository.TeacherRepository;

@Service
@Transactional
public class SchoolClassService {

    private static final Logger logger = LoggerFactory.getLogger(SchoolClassService.class);

    @Autowired
    private SchoolClassRepository schoolClassRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Create a new class
     */
    public SchoolClass createClass(SchoolClass schoolClass) {
        // Check for duplicate
        if (schoolClassRepository.existsByNameAndAcademicYear(
                schoolClass.getName(), schoolClass.getAcademicYear())) {
            throw new RuntimeException("Class already exists for this academic year: " + schoolClass.getName());
        }

        // Set level type based on form level
        if (schoolClass.getLevelType() == null) {
            schoolClass.setLevelType(schoolClass.getFormLevel() <= 4 
                ? SchoolClass.LevelType.O_LEVEL 
                : SchoolClass.LevelType.A_LEVEL);
        }

        if (schoolClass.getIsActive() == null) {
            schoolClass.setIsActive(true);
        }

        SchoolClass saved = schoolClassRepository.save(schoolClass);
        logger.info("Class created: {}", saved.getName());
        return saved;
    }

    /**
     * Get all classes
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> getAllClasses() {
        return schoolClassRepository.findAll();
    }

    /**
     * Get class by ID
     */
    @Transactional(readOnly = true)
    public Optional<SchoolClass> getClassById(Long id) {
        return schoolClassRepository.findById(id);
    }

    /**
     * Get class by name
     */
    @Transactional(readOnly = true)
    public Optional<SchoolClass> getClassByName(String name) {
        return schoolClassRepository.findByName(name);
    }

    /**
     * Get classes by academic year
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> getClassesByAcademicYear(String academicYear) {
        return schoolClassRepository.findByAcademicYearAndIsActiveTrue(academicYear);
    }

    /**
     * Get O-Level classes
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> getOLevelClasses(String academicYear) {
        return schoolClassRepository.findOLevelClasses(academicYear);
    }

    /**
     * Get A-Level classes
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> getALevelClasses(String academicYear) {
        return schoolClassRepository.findALevelClasses(academicYear);
    }

    /**
     * Get classes by form level
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> getClassesByFormLevel(Integer formLevel, String academicYear) {
        return schoolClassRepository.findByFormLevelAndAcademicYear(formLevel, academicYear);
    }

    /**
     * Update class
     */
    public SchoolClass updateClass(Long id, SchoolClass details) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        if (details.getName() != null) {
            schoolClass.setName(details.getName());
        }
        if (details.getStream() != null) {
            schoolClass.setStream(details.getStream());
        }
        if (details.getMaxCapacity() != null) {
            schoolClass.setMaxCapacity(details.getMaxCapacity());
        }
        if (details.getClassroom() != null) {
            schoolClass.setClassroom(details.getClassroom());
        }
        if (details.getBuilding() != null) {
            schoolClass.setBuilding(details.getBuilding());
        }
        if (details.getNotes() != null) {
            schoolClass.setNotes(details.getNotes());
        }

        logger.info("Class updated: {}", schoolClass.getName());
        return schoolClassRepository.save(schoolClass);
    }

    /**
     * Assign class teacher
     */
    public SchoolClass assignClassTeacher(Long classId, Long teacherId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));

        Teacher teacher = teacherRepository.findById(teacherId)
            .orElseThrow(() -> new RuntimeException("Teacher not found with id: " + teacherId));

        schoolClass.setClassTeacher(teacher);
        
        // Update teacher's class responsibility
        teacher.setIsClassTeacher(true);
        teacher.setClassResponsibility(schoolClass.getName());
        teacherRepository.save(teacher);

        logger.info("Class teacher assigned: {} -> {}", teacher.getTeacherId(), schoolClass.getName());
        return schoolClassRepository.save(schoolClass);
    }

    /**
     * Assign course to class (A-Level)
     */
    public SchoolClass assignCourse(Long classId, Long courseId) {
        SchoolClass schoolClass = schoolClassRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));

        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (schoolClass.getLevelType() != SchoolClass.LevelType.A_LEVEL) {
            throw new RuntimeException("Courses can only be assigned to A-Level classes");
        }

        schoolClass.setCourse(course);
        logger.info("Course assigned to class: {} -> {}", course.getCode(), schoolClass.getName());
        return schoolClassRepository.save(schoolClass);
    }

    /**
     * Delete class
     */
    public void deleteClass(Long id) {
        SchoolClass schoolClass = schoolClassRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));

        if (schoolClass.getCurrentCount() > 0) {
            throw new RuntimeException("Cannot delete class with enrolled students");
        }

        schoolClassRepository.deleteById(id);
        logger.info("Class deleted: {}", schoolClass.getName());
    }

    /**
     * Search classes
     */
    @Transactional(readOnly = true)
    public List<SchoolClass> searchClasses(String searchTerm) {
        return schoolClassRepository.searchClasses(searchTerm);
    }

    /**
     * Get class enrollment summary
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEnrollmentSummary(String academicYear) {
        List<Object[]> data = schoolClassRepository.getClassEnrollmentSummary(academicYear);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : data) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("className", row[0]);
            entry.put("currentCount", row[1]);
            entry.put("maxCapacity", row[2]);
            result.add(entry);
        }

        return result;
    }

    /**
     * Initialize default classes for Ugandan secondary school
     */
    public void initializeDefaultClasses(String academicYear) {
        String[] streams = {"A", "B"};
        
        // O-Level: S1-S4
        for (int form = 1; form <= 4; form++) {
            for (String stream : streams) {
                String className = "S" + form + stream;
                if (!schoolClassRepository.existsByNameAndAcademicYear(className, academicYear)) {
                    SchoolClass schoolClass = new SchoolClass();
                    schoolClass.setName(className);
                    schoolClass.setFormLevel(form);
                    schoolClass.setStream(stream);
                    schoolClass.setLevelType(SchoolClass.LevelType.O_LEVEL);
                    schoolClass.setAcademicYear(academicYear);
                    schoolClass.setMaxCapacity(50);
                    schoolClassRepository.save(schoolClass);
                }
            }
        }

        logger.info("Default O-Level classes initialized for {}", academicYear);
    }

    /**
     * Get class statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getClassStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalClasses", schoolClassRepository.count());
        stats.put("activeClasses", schoolClassRepository.findByIsActiveTrue().size());
        return stats;
    }
}
