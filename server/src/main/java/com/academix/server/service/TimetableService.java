package com.academix.server.service;

import java.time.LocalTime;
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

import com.academix.server.model.Teacher;
import com.academix.server.model.Timetable;
import com.academix.server.repository.TimetableRepository;

@Service
@Transactional
public class TimetableService {

    private static final Logger logger = LoggerFactory.getLogger(TimetableService.class);

    @Autowired
    private TimetableRepository timetableRepository;
    
    @Autowired
    private TeacherService teacherService;

    /**
     * Populate teacher name based on teacher ID
     */
    private void populateTeacherName(Timetable timetable) {
        if (timetable.getTeacherId() != null) {
            try {
                Optional<Teacher> teacher = teacherService.getTeacherById(timetable.getTeacherId());
                if (teacher.isPresent()) {
                    Teacher t = teacher.get();
                    String teacherName = t.getFirstName() + " " + t.getLastName();
                    timetable.setTeacherName(teacherName);
                } else {
                    logger.warn("Teacher not found with ID: {}", timetable.getTeacherId());
                    timetable.setTeacherName("Teacher Not Found");
                }
            } catch (Exception e) {
                logger.error("Error fetching teacher with ID: {}", timetable.getTeacherId(), e);
                timetable.setTeacherName("Error Loading Teacher");
            }
        }
    }

    /**
     * Create a new timetable entry
     */
    public Timetable createTimetableEntry(Timetable timetable) {
        // Validate no conflicts
        validateNoConflicts(timetable, null);

        // Populate teacher name if teacherId is provided
        populateTeacherName(timetable);

        if (timetable.getIsActive() == null) {
            timetable.setIsActive(true);
        }
        if (timetable.getPeriodType() == null) {
            timetable.setPeriodType(Timetable.PeriodType.LESSON);
        }
        if (timetable.getIsDoublePeriod() == null) {
            timetable.setIsDoublePeriod(false);
        }

        Timetable saved = timetableRepository.save(timetable);
        logger.info("Timetable entry created: {} - {} - Period {} - Teacher: {}", 
            saved.getClassName(), saved.getDayOfWeek(), saved.getPeriodNumber(), saved.getTeacherName());
        return saved;
    }

    /**
     * Bulk create timetable entries
     */
    public List<Timetable> createBulkTimetableEntries(List<Timetable> entries) {
        List<Timetable> savedEntries = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Timetable entry : entries) {
            try {
                savedEntries.add(createTimetableEntry(entry));
            } catch (Exception e) {
                errors.add(entry.getClassName() + " " + entry.getDayOfWeek() + 
                    " Period " + entry.getPeriodNumber() + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            logger.warn("Bulk timetable entry had {} errors: {}", errors.size(), errors);
        }

        return savedEntries;
    }

    /**
     * Get all timetable entries
     */
    @Transactional(readOnly = true)
    public List<Timetable> getAllTimetableEntries() {
        return timetableRepository.findAll();
    }

    /**
     * Get timetable by ID
     */
    @Transactional(readOnly = true)
    public Optional<Timetable> getTimetableById(Long id) {
        return timetableRepository.findById(id);
    }

    /**
     * Get timetable by class (class_id)
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTimetableByClass(String className) {
        return timetableRepository.findByClassNameAndIsActiveTrue(className);
    }

    /**
     * Get timetable by class, academic year, and term
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTimetableByClassAndPeriod(String className, String academicYear, Integer term) {
        return timetableRepository.findByClassNameAndAcademicYearAndTerm(className, academicYear, term);
    }

    /**
     * Get timetable by class and day
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTimetableByClassAndDay(String className, Timetable.DayOfWeek dayOfWeek) {
        return timetableRepository.findByClassNameAndDayOfWeek(className, dayOfWeek);
    }

    /**
     * Get teacher's timetable
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTeacherTimetable(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId);
    }

    /**
     * Get teacher's timetable by academic year and term
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTeacherTimetableByPeriod(Long teacherId, String academicYear, Integer term) {
        return timetableRepository.findByTeacherIdAndAcademicYearAndTerm(teacherId, academicYear, term);
    }

    /**
     * Get room schedule
     */
    @Transactional(readOnly = true)
    public List<Timetable> getRoomSchedule(String room) {
        return timetableRepository.findByRoom(room);
    }

    /**
     * Update timetable entry
     */
    public Timetable updateTimetableEntry(Long id, Timetable details) {
        Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + id));

        // Validate no conflicts (excluding this entry)
        validateNoConflicts(details, id);

        if (details.getClassName() != null) {
            timetable.setClassName(details.getClassName());
        }
        if (details.getStream() != null) {
            timetable.setStream(details.getStream());
        }
        if (details.getDayOfWeek() != null) {
            timetable.setDayOfWeek(details.getDayOfWeek());
        }
        if (details.getPeriodNumber() != null) {
            timetable.setPeriodNumber(details.getPeriodNumber());
        }
        if (details.getPeriodName() != null) {
            timetable.setPeriodName(details.getPeriodName());
        }
        if (details.getStartTime() != null) {
            timetable.setStartTime(details.getStartTime());
        }
        if (details.getEndTime() != null) {
            timetable.setEndTime(details.getEndTime());
        }
        if (details.getSubjectCode() != null) {
            timetable.setSubjectCode(details.getSubjectCode());
        }
        if (details.getSubjectName() != null) {
            timetable.setSubjectName(details.getSubjectName());
        }
        if (details.getTeacherId() != null) {
            timetable.setTeacherId(details.getTeacherId());
            // Populate teacher name when teacherId is updated
            populateTeacherName(timetable);
        }
        if (details.getTeacherName() != null) {
            timetable.setTeacherName(details.getTeacherName());
        }
        if (details.getRoom() != null) {
            timetable.setRoom(details.getRoom());
        }
        if (details.getBuilding() != null) {
            timetable.setBuilding(details.getBuilding());
        }
        if (details.getPeriodType() != null) {
            timetable.setPeriodType(details.getPeriodType());
        }
        if (details.getIsDoublePeriod() != null) {
            timetable.setIsDoublePeriod(details.getIsDoublePeriod());
        }
        if (details.getNotes() != null) {
            timetable.setNotes(details.getNotes());
        }

        logger.info("Timetable entry updated: {} - {} - Period {}", 
            timetable.getClassName(), timetable.getDayOfWeek(), timetable.getPeriodNumber());
        return timetableRepository.save(timetable);
    }

    /**
     * Delete timetable entry
     */
    public void deleteTimetableEntry(Long id) {
        Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + id));

        timetableRepository.deleteById(id);
        logger.info("Timetable entry deleted: {} - {} - Period {}", 
            timetable.getClassName(), timetable.getDayOfWeek(), timetable.getPeriodNumber());
    }

    /**
     * Deactivate timetable entry (soft delete)
     */
    public Timetable deactivateTimetableEntry(Long id) {
        Timetable timetable = timetableRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Timetable entry not found with id: " + id));

        timetable.setIsActive(false);
        logger.info("Timetable entry deactivated: {}", id);
        return timetableRepository.save(timetable);
    }

    /**
     * Validate no scheduling conflicts
     */
    private void validateNoConflicts(Timetable entry, Long excludeId) {
        if (entry.getPeriodType() != Timetable.PeriodType.LESSON) {
            return; // Only validate conflicts for actual lessons
        }

        // Check teacher conflicts
        if (entry.getTeacherId() != null) {
            List<Timetable> teacherConflicts = timetableRepository.findTeacherConflicts(
                entry.getTeacherId(), entry.getDayOfWeek(), 
                entry.getStartTime(), entry.getEndTime(),
                entry.getAcademicYear(), entry.getTerm());

            if (excludeId != null) {
                teacherConflicts.removeIf(t -> t.getId().equals(excludeId));
            }

            if (!teacherConflicts.isEmpty()) {
                throw new RuntimeException("Teacher is already scheduled at this time: " + 
                    teacherConflicts.get(0).getClassName() + " " + teacherConflicts.get(0).getSubjectCode());
            }
        }

        // Check room conflicts
        if (entry.getRoom() != null && !entry.getRoom().isEmpty()) {
            List<Timetable> roomConflicts = timetableRepository.findRoomConflicts(
                entry.getRoom(), entry.getDayOfWeek(),
                entry.getStartTime(), entry.getEndTime(),
                entry.getAcademicYear(), entry.getTerm());

            if (excludeId != null) {
                roomConflicts.removeIf(t -> t.getId().equals(excludeId));
            }

            if (!roomConflicts.isEmpty()) {
                throw new RuntimeException("Room is already booked at this time: " + 
                    roomConflicts.get(0).getClassName() + " " + roomConflicts.get(0).getSubjectCode());
            }
        }

        // Check class conflicts
        List<Timetable> classConflicts = timetableRepository.findClassConflicts(
            entry.getClassName(), entry.getDayOfWeek(),
            entry.getStartTime(), entry.getEndTime(),
            entry.getAcademicYear(), entry.getTerm());

        if (excludeId != null) {
            classConflicts.removeIf(t -> t.getId().equals(excludeId));
        }

        if (!classConflicts.isEmpty()) {
            throw new RuntimeException("Class already has a lesson scheduled at this time: " + 
                classConflicts.get(0).getSubjectCode());
        }
    }

    /**
     * Get timetable by academic year and term
     */
    @Transactional(readOnly = true)
    public List<Timetable> getTimetableByAcademicPeriod(String academicYear, Integer term) {
        return timetableRepository.findByAcademicYearAndTerm(academicYear, term);
    }

    /**
     * Search timetable
     */
    @Transactional(readOnly = true)
    public List<Timetable> searchTimetable(String searchTerm) {
        return timetableRepository.searchTimetable(searchTerm);
    }

    /**
     * Get teacher workloads
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTeacherWorkloads(String academicYear, Integer term) {
        List<Object[]> workloads = timetableRepository.getTeacherWorkloads(academicYear, term);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : workloads) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("teacherId", row[0]);
            entry.put("teacherName", row[1]);
            entry.put("periodsPerWeek", row[2]);
            result.add(entry);
        }

        return result;
    }

    /**
     * Get periods per subject for a class
     */
    @Transactional(readOnly = true)
    public Map<String, Long> getPeriodsPerSubject(String className, String academicYear, Integer term) {
        List<Object[]> counts = timetableRepository.countPeriodsPerSubject(className, academicYear, term);
        Map<String, Long> result = new HashMap<>();

        for (Object[] row : counts) {
            result.put((String) row[0], (Long) row[1]);
        }

        return result;
    }

    /**
     * Get timetable statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getTimetableStatistics() {
        Map<String, Object> stats = new HashMap<>();
        long totalEntries = timetableRepository.count();
        long totalClasses = timetableRepository.countDistinctClasses();
        long totalTeachers = timetableRepository.countDistinctTeachers();
        long totalSubjects = timetableRepository.countDistinctSubjects();
        long lessonEntries = timetableRepository.countLessonEntries();

        stats.put("totalEntries", totalEntries);
        stats.put("totalClasses", totalClasses);
        stats.put("totalTeachers", totalTeachers);
        stats.put("totalSubjects", totalSubjects);

        // Average lesson periods per class per day (Mon-Fri = 5 days)
        double avgPeriodsPerDay = totalClasses > 0 ? (double) lessonEntries / (totalClasses * 5) : 0;
        stats.put("averagePeriodsPerDay", Math.round(avgPeriodsPerDay * 10.0) / 10.0);

        return stats;
    }

    /**
     * Generate standard Ugandan secondary school timetable template
     */
    public List<Map<String, Object>> getStandardPeriodTemplate() {
        List<Map<String, Object>> template = new ArrayList<>();

        // Morning Prep - Boarding schools
        template.add(createPeriodTemplate(0, "Morning Prep", LocalTime.of(5, 30), LocalTime.of(6, 30), Timetable.PeriodType.MORNING_PREP));
        
        // Assembly
        template.add(createPeriodTemplate(1, "Assembly", LocalTime.of(7, 30), LocalTime.of(8, 0), Timetable.PeriodType.ASSEMBLY));
        
        // Morning lessons
        template.add(createPeriodTemplate(2, "Period 1", LocalTime.of(8, 0), LocalTime.of(8, 40), Timetable.PeriodType.LESSON));
        template.add(createPeriodTemplate(3, "Period 2", LocalTime.of(8, 40), LocalTime.of(9, 20), Timetable.PeriodType.LESSON));
        template.add(createPeriodTemplate(4, "Period 3", LocalTime.of(9, 20), LocalTime.of(10, 0), Timetable.PeriodType.LESSON));
        
        // Break
        template.add(createPeriodTemplate(5, "Break", LocalTime.of(10, 0), LocalTime.of(10, 30), Timetable.PeriodType.BREAK));
        
        // Mid-morning lessons
        template.add(createPeriodTemplate(6, "Period 4", LocalTime.of(10, 30), LocalTime.of(11, 10), Timetable.PeriodType.LESSON));
        template.add(createPeriodTemplate(7, "Period 5", LocalTime.of(11, 10), LocalTime.of(11, 50), Timetable.PeriodType.LESSON));
        template.add(createPeriodTemplate(8, "Period 6", LocalTime.of(11, 50), LocalTime.of(12, 30), Timetable.PeriodType.LESSON));
        
        // Lunch
        template.add(createPeriodTemplate(9, "Lunch", LocalTime.of(12, 30), LocalTime.of(14, 0), Timetable.PeriodType.LUNCH));
        
        // Afternoon lessons
        template.add(createPeriodTemplate(10, "Period 7", LocalTime.of(14, 0), LocalTime.of(14, 40), Timetable.PeriodType.LESSON));
        template.add(createPeriodTemplate(11, "Period 8", LocalTime.of(14, 40), LocalTime.of(15, 20), Timetable.PeriodType.LESSON));
        
        // Games/Sports
        template.add(createPeriodTemplate(12, "Games", LocalTime.of(15, 30), LocalTime.of(17, 0), Timetable.PeriodType.GAMES));
        
        // Evening Prep - Boarding schools
        template.add(createPeriodTemplate(13, "Evening Prep", LocalTime.of(19, 0), LocalTime.of(21, 0), Timetable.PeriodType.EVENING_PREP));

        return template;
    }

    private Map<String, Object> createPeriodTemplate(int order, String name, LocalTime start, LocalTime end, Timetable.PeriodType type) {
        Map<String, Object> period = new HashMap<>();
        period.put("order", order);
        period.put("name", name);
        period.put("startTime", start.toString());
        period.put("endTime", end.toString());
        period.put("type", type.name());
        period.put("durationMinutes", (int) java.time.Duration.between(start, end).toMinutes());
        return period;
    }
}
