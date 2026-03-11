package com.academix.server.service;

import java.time.LocalDate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.academix.server.model.Exam;
import com.academix.server.model.Result;
import com.academix.server.repository.ExamRepository;
import com.academix.server.repository.ResultRepository;

@Service
@Transactional
public class ExamService {

    private static final Logger logger = LoggerFactory.getLogger(ExamService.class);

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ResultRepository resultRepository;

    /**
     * Create a new exam
     */
    public Exam createExam(Exam exam) {
        if (examRepository.existsByCode(exam.getCode())) {
            throw new RuntimeException("Exam code already exists: " + exam.getCode());
        }

        if (exam.getStatus() == null) {
            exam.setStatus(Exam.ExamStatus.DRAFT);
        }
        if (exam.getIsLocked() == null) {
            exam.setIsLocked(false);
        }
        if (exam.getIsPublished() == null) {
            exam.setIsPublished(false);
        }
        if (exam.getPassMark() == null) {
            exam.setPassMark(34); // Ugandan pass mark
        }
        if (exam.getTotalMarks() == null) {
            exam.setTotalMarks(100);
        }

        Exam saved = examRepository.save(exam);
        logger.info("Exam created: {} - {}", saved.getCode(), saved.getName());
        return saved;
    }

    /**
     * Get all exams
     */
    @Transactional(readOnly = true)
    public List<Exam> getAllExams() {
        return examRepository.findAll();
    }

    /**
     * Get exam by ID
     */
    @Transactional(readOnly = true)
    public Optional<Exam> getExamById(Long id) {
        return examRepository.findById(id);
    }

    /**
     * Get exam by code
     */
    @Transactional(readOnly = true)
    public Optional<Exam> getExamByCode(String code) {
        return examRepository.findByCode(code);
    }

    /**
     * Update exam
     */
    public Exam updateExam(Long id, Exam details) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        if (exam.getIsLocked()) {
            throw new RuntimeException("Cannot update a locked exam");
        }

        if (details.getName() != null) {
            exam.setName(details.getName());
        }
        if (details.getType() != null) {
            exam.setType(details.getType());
        }
        if (details.getStartDate() != null) {
            exam.setStartDate(details.getStartDate());
        }
        if (details.getEndDate() != null) {
            exam.setEndDate(details.getEndDate());
        }
        if (details.getMarksEntryDeadline() != null) {
            exam.setMarksEntryDeadline(details.getMarksEntryDeadline());
        }
        if (details.getStatus() != null) {
            exam.setStatus(details.getStatus());
        }
        if (details.getDescription() != null) {
            exam.setDescription(details.getDescription());
        }
        if (details.getTargetClasses() != null && !details.getTargetClasses().isEmpty()) {
            exam.setTargetClasses(details.getTargetClasses());
        }
        if (details.getPassMark() != null) {
            exam.setPassMark(details.getPassMark());
        }
        if (details.getTotalMarks() != null) {
            exam.setTotalMarks(details.getTotalMarks());
        }

        logger.info("Exam updated: {}", exam.getCode());
        return examRepository.save(exam);
    }

    /**
     * Delete exam
     */
    public void deleteExam(Long id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        if (exam.getIsPublished()) {
            throw new RuntimeException("Cannot delete a published exam");
        }

        // Check if results exist
        long resultCount = resultRepository.countByExamId(id);
        if (resultCount > 0) {
            throw new RuntimeException("Cannot delete exam with existing results. Found " + resultCount + " results.");
        }

        examRepository.deleteById(id);
        logger.info("Exam deleted: {}", exam.getCode());
    }

    /**
     * Lock exam - prevents further marks entry
     */
    public Exam lockExam(Long id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        exam.lock();
        logger.info("Exam locked: {}", exam.getCode());
        return examRepository.save(exam);
    }

    /**
     * Unlock exam - allows marks entry again
     */
    public Exam unlockExam(Long id) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        if (exam.getIsPublished()) {
            throw new RuntimeException("Cannot unlock a published exam");
        }

        exam.setIsLocked(false);
        exam.setStatus(Exam.ExamStatus.MARKS_ENTRY);
        logger.info("Exam unlocked: {}", exam.getCode());
        return examRepository.save(exam);
    }

    /**
     * Publish exam results
     */
    public Exam publishExam(Long id, Long publishedBy) {
        Exam exam = examRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + id));

        if (!exam.getIsLocked()) {
            throw new RuntimeException("Exam must be locked before publishing");
        }

        exam.publish(publishedBy);
        logger.info("Exam published: {} by user {}", exam.getCode(), publishedBy);
        return examRepository.save(exam);
    }

    /**
     * Get exams by academic year
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsByAcademicYear(String academicYear) {
        return examRepository.findByAcademicYear(academicYear);
    }

    /**
     * Get exams by academic year and term
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsByAcademicYearAndTerm(String academicYear, Integer term) {
        return examRepository.findByAcademicYearAndTerm(academicYear, term);
    }

    /**
     * Get exams by type
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsByType(Exam.ExamType type) {
        return examRepository.findByType(type);
    }

    /**
     * Get exams by status
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsByStatus(Exam.ExamStatus status) {
        return examRepository.findByStatus(status);
    }

    /**
     * Get upcoming exams
     */
    @Transactional(readOnly = true)
    public List<Exam> getUpcomingExams() {
        return examRepository.findUpcomingExams(LocalDate.now());
    }

    /**
     * Get ongoing exams
     */
    @Transactional(readOnly = true)
    public List<Exam> getOngoingExams() {
        return examRepository.findOngoingExams(LocalDate.now());
    }

    /**
     * Get exams for a class
     */
    @Transactional(readOnly = true)
    public List<Exam> getExamsForClass(String className) {
        return examRepository.findByTargetClass(className);
    }

    /**
     * Search exams
     */
    @Transactional(readOnly = true)
    public List<Exam> searchExams(String searchTerm) {
        return examRepository.searchExams(searchTerm);
    }

    /**
     * Get student transcript - all results for a student
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentTranscript(Long studentId) {
        List<Result> results = resultRepository.findByStudentId(studentId);

        Map<String, Object> transcript = new HashMap<>();
        transcript.put("studentId", studentId);
        transcript.put("totalExams", results.stream().map(Result::getExamId).distinct().count());
        transcript.put("totalSubjects", results.stream().map(Result::getSubjectCode).distinct().count());

        // Group results by academic year and term
        Map<String, Map<String, List<Result>>> groupedResults = new HashMap<>();
        for (Result result : results) {
            String yearKey = result.getAcademicYear();
            String termKey = "Term " + result.getTerm();
            
            groupedResults.computeIfAbsent(yearKey, k -> new HashMap<>())
                         .computeIfAbsent(termKey, k -> new java.util.ArrayList<>())
                         .add(result);
        }
        
        transcript.put("resultsByYearAndTerm", groupedResults);
        transcript.put("results", results);

        return transcript;
    }

    /**
     * Get exam analytics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getExamAnalytics(Long examId) {
        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + examId));

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("examCode", exam.getCode());
        analytics.put("examName", exam.getName());
        analytics.put("academicYear", exam.getAcademicYear());
        analytics.put("term", exam.getTerm());
        analytics.put("targetClasses", exam.getTargetClasses());

        // Get results count
        long totalResults = resultRepository.countByExamId(examId);
        analytics.put("totalResultsEntered", totalResults);

        // Class-wise analysis
        Map<String, Object> classAnalysis = new HashMap<>();
        for (String className : exam.getTargetClasses()) {
            Map<String, Object> classStats = new HashMap<>();
            List<Object[]> subjectPerformance = resultRepository.getSubjectPerformanceAnalysis(examId, className);
            
            classStats.put("resultsCount", resultRepository.countByClassNameAndExamId(className, examId));
            classStats.put("subjectPerformance", subjectPerformance);
            classStats.put("topPerformers", resultRepository.getTopPerformersInClass(examId, className));
            
            classAnalysis.put(className, classStats);
        }
        analytics.put("classAnalysis", classAnalysis);

        return analytics;
    }

    /**
     * Get overall exam analytics (dashboard)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getOverallAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        
        analytics.put("totalExams", examRepository.count());
        analytics.put("draftExams", examRepository.countByStatus(Exam.ExamStatus.DRAFT));
        analytics.put("scheduledExams", examRepository.countByStatus(Exam.ExamStatus.SCHEDULED));
        analytics.put("inProgressExams", examRepository.countByStatus(Exam.ExamStatus.IN_PROGRESS));
        analytics.put("completedExams", examRepository.countByStatus(Exam.ExamStatus.COMPLETED));
        analytics.put("publishedExams", examRepository.countByStatus(Exam.ExamStatus.PUBLISHED));
        
        analytics.put("upcomingExams", examRepository.findUpcomingExams(LocalDate.now()).size());
        analytics.put("ongoingExams", examRepository.findOngoingExams(LocalDate.now()).size());
        
        // By type
        Map<String, Long> byType = new HashMap<>();
        for (Exam.ExamType type : Exam.ExamType.values()) {
            byType.put(type.name(), examRepository.countByType(type));
        }
        analytics.put("examsByType", byType);

        return analytics;
    }

    /**
     * Get exam statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getExamStatistics() {
        return getOverallAnalytics();
    }
}
