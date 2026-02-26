package com.academix.server.service;

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
import com.academix.server.repository.CourseRepository;

@Service
@Transactional
public class CourseService {

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    private CourseRepository courseRepository;

    /**
     * Create a new course/combination
     */
    public Course createCourse(Course course) {
        if (courseRepository.existsByCode(course.getCode())) {
            throw new RuntimeException("Course code already exists: " + course.getCode());
        }

        if (course.getIsActive() == null) {
            course.setIsActive(true);
        }
        if (course.getMaxStudents() == null) {
            course.setMaxStudents(0);
        }
        if (course.getCurrentEnrollment() == null) {
            course.setCurrentEnrollment(0);
        }

        Course saved = courseRepository.save(course);
        logger.info("Course created: {} - {}", saved.getCode(), saved.getName());
        return saved;
    }

    /**
     * Get all courses
     */
    @Transactional(readOnly = true)
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    /**
     * Get active courses
     */
    @Transactional(readOnly = true)
    public List<Course> getActiveCourses() {
        return courseRepository.findByIsActiveTrue();
    }

    /**
     * Get course by ID
     */
    @Transactional(readOnly = true)
    public Optional<Course> getCourseById(Long id) {
        return courseRepository.findById(id);
    }

    /**
     * Get course by code
     */
    @Transactional(readOnly = true)
    public Optional<Course> getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    /**
     * Update course
     */
    public Course updateCourse(Long id, Course details) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));

        if (details.getName() != null) {
            course.setName(details.getName());
        }
        if (details.getType() != null) {
            course.setType(details.getType());
        }
        if (details.getLevel() != null) {
            course.setLevel(details.getLevel());
        }
        if (details.getPrincipalSubjects() != null && !details.getPrincipalSubjects().isEmpty()) {
            course.setPrincipalSubjects(details.getPrincipalSubjects());
        }
        if (details.getSubsidiarySubjects() != null && !details.getSubsidiarySubjects().isEmpty()) {
            course.setSubsidiarySubjects(details.getSubsidiarySubjects());
        }
        if (details.getDescription() != null) {
            course.setDescription(details.getDescription());
        }
        if (details.getCareerPaths() != null) {
            course.setCareerPaths(details.getCareerPaths());
        }
        if (details.getRequirements() != null) {
            course.setRequirements(details.getRequirements());
        }
        if (details.getMaxStudents() != null) {
            course.setMaxStudents(details.getMaxStudents());
        }
        if (details.getIsActive() != null) {
            course.setIsActive(details.getIsActive());
        }

        logger.info("Course updated: {}", course.getCode());
        return courseRepository.save(course);
    }

    /**
     * Delete course
     */
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + id));
        course.setIsActive(false);
        courseRepository.save(course);
        logger.info("Course deactivated: {}", course.getCode());
    }

    /**
     * Get courses by type
     */
    @Transactional(readOnly = true)
    public List<Course> getCoursesByType(Course.CourseType type) {
        return courseRepository.findByType(type);
    }

    /**
     * Get A-Level courses
     */
    @Transactional(readOnly = true)
    public List<Course> getALevelCourses() {
        return courseRepository.findByLevelAndIsActiveTrue(Course.CourseLevel.A_LEVEL);
    }

    /**
     * Get available courses (with slots)
     */
    @Transactional(readOnly = true)
    public List<Course> getAvailableCourses() {
        return courseRepository.findAvailableCourses();
    }

    /**
     * Search courses
     */
    @Transactional(readOnly = true)
    public List<Course> searchCourses(String searchTerm) {
        return courseRepository.searchCourses(searchTerm);
    }

    /**
     * Enroll student in course
     */
    public Course enrollStudent(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getMaxStudents() > 0 && course.getCurrentEnrollment() >= course.getMaxStudents()) {
            throw new RuntimeException("Course is full");
        }

        course.setCurrentEnrollment(course.getCurrentEnrollment() + 1);
        return courseRepository.save(course);
    }

    /**
     * Withdraw student from course
     */
    public Course withdrawStudent(Long courseId) {
        Course course = courseRepository.findById(courseId)
            .orElseThrow(() -> new RuntimeException("Course not found with id: " + courseId));

        if (course.getCurrentEnrollment() > 0) {
            course.setCurrentEnrollment(course.getCurrentEnrollment() - 1);
        }
        return courseRepository.save(course);
    }

    /**
     * Get course statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getCourseStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCourses", courseRepository.count());
        stats.put("activeCourses", courseRepository.countByIsActiveTrue());
        stats.put("scienceCourses", courseRepository.countByType(Course.CourseType.SCIENCES));
        stats.put("artsCourses", courseRepository.countByType(Course.CourseType.ARTS));
        stats.put("technicalCourses", courseRepository.countByType(Course.CourseType.TECHNICAL));
        return stats;
    }

    /**
     * Initialize default Ugandan A-Level combinations
     */
    public void initializeDefaultCourses() {
        if (courseRepository.count() > 0) {
            logger.info("Courses already exist, skipping initialization");
            return;
        }

        // Science combinations
        createDefaultCourse("PCM", "Physics, Chemistry, Mathematics", Course.CourseType.SCIENCES,
            List.of("PHY", "CHM", "MTH"), List.of("GP", "SUB"),
            "Engineering, Medicine, Architecture, Computer Science");

        createDefaultCourse("PCB", "Physics, Chemistry, Biology", Course.CourseType.SCIENCES,
            List.of("PHY", "CHM", "BIO"), List.of("GP", "SUB"),
            "Medicine, Pharmacy, Nursing, Veterinary");

        createDefaultCourse("BCM", "Biology, Chemistry, Mathematics", Course.CourseType.SCIENCES,
            List.of("BIO", "CHM", "MTH"), List.of("GP", "SUB"),
            "Medicine, Pharmacy, Agriculture");

        createDefaultCourse("MEG", "Mathematics, Economics, Geography", Course.CourseType.MIXED,
            List.of("MTH", "ECO", "GEO"), List.of("GP", "SUB"),
            "Economics, Business, Urban Planning");

        // Arts combinations
        createDefaultCourse("HEG", "History, Economics, Geography", Course.CourseType.ARTS,
            List.of("HIS", "ECO", "GEO"), List.of("GP", "SUB"),
            "Law, Public Administration, Journalism");

        createDefaultCourse("HEL", "History, Economics, Literature", Course.CourseType.ARTS,
            List.of("HIS", "ECO", "LIT"), List.of("GP", "SUB"),
            "Law, Education, Journalism");

        createDefaultCourse("HED", "History, Economics, Divinity", Course.CourseType.ARTS,
            List.of("HIS", "ECO", "CRE"), List.of("GP", "SUB"),
            "Theology, Social Work, Education");

        createDefaultCourse("LEG", "Literature, Economics, Geography", Course.CourseType.ARTS,
            List.of("LIT", "ECO", "GEO"), List.of("GP", "SUB"),
            "Education, Media, Social Sciences");

        logger.info("Default Ugandan A-Level combinations initialized");
    }

    private void createDefaultCourse(String code, String name, Course.CourseType type,
                                      List<String> principals, List<String> subsidiaries,
                                      String careers) {
        Course course = new Course();
        course.setCode(code);
        course.setName(name);
        course.setType(type);
        course.setLevel(Course.CourseLevel.A_LEVEL);
        course.setPrincipalSubjects(principals);
        course.setSubsidiarySubjects(subsidiaries);
        course.setCareerPaths(careers);
        course.setIsActive(true);
        course.setMaxStudents(0);
        course.setCurrentEnrollment(0);
        courseRepository.save(course);
    }
}
