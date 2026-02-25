package com.academix.server.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
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

import com.academix.server.model.Exam;
import com.academix.server.model.Result;
import com.academix.server.model.Student;
import com.academix.server.repository.ExamRepository;
import com.academix.server.repository.ResultRepository;
import com.academix.server.repository.StudentRepository;

@Service
@Transactional
public class ResultService {

    private static final Logger logger = LoggerFactory.getLogger(ResultService.class);

    @Autowired
    private ResultRepository resultRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private StudentRepository studentRepository;

    /**
     * Create/Enter a result
     */
    public Result createResult(Result result) {
        // Validate exam exists and is not locked
        Exam exam = examRepository.findById(result.getExamId())
            .orElseThrow(() -> new RuntimeException("Exam not found with id: " + result.getExamId()));

        if (exam.getIsLocked()) {
            throw new RuntimeException("Exam is locked. Cannot enter marks.");
        }

        // Validate student exists
        Student student = studentRepository.findById(result.getStudentId())
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + result.getStudentId()));

        // Check if result already exists
        if (resultRepository.existsByStudentIdAndExamIdAndSubjectCode(
                result.getStudentId(), result.getExamId(), result.getSubjectCode())) {
            throw new RuntimeException("Result already exists for this student, exam, and subject");
        }

        // Set additional fields from student
        result.setStudentNumber(student.getStudentId());
        result.setClassName(student.getCurrentClass());
        result.setStream(student.getStream());

        // Set exam details
        result.setExamCode(exam.getCode());
        result.setAcademicYear(exam.getAcademicYear());
        result.setTerm(exam.getTerm());

        // Set grading scale based on exam
        if (result.getGradingScale() == null) {
            result.setGradingScale(exam.getGradingScale() == Exam.GradingScale.A_LEVEL 
                ? Result.GradingScaleType.A_LEVEL 
                : Result.GradingScaleType.O_LEVEL);
        }

        // Calculate total marks if paper marks provided
        if (result.getPaper1Marks() != null || result.getPaper2Marks() != null || result.getPaper3Marks() != null) {
            int total = 0;
            if (result.getPaper1Marks() != null) total += result.getPaper1Marks();
            if (result.getPaper2Marks() != null) total += result.getPaper2Marks();
            if (result.getPaper3Marks() != null) total += result.getPaper3Marks();
            result.setMarksObtained(total);
        }

        // Calculate grade
        result.calculateGrade();

        // Set entry info
        result.setEnteredAt(LocalDateTime.now());

        Result saved = resultRepository.save(result);
        logger.info("Result created - Student: {}, Exam: {}, Subject: {}, Grade: {}",
            student.getStudentId(), exam.getCode(), result.getSubjectCode(), result.getGrade());

        return saved;
    }

    /**
     * Bulk create/enter results
     */
    public List<Result> createBulkResults(List<Result> results) {
        List<Result> savedResults = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Result result : results) {
            try {
                savedResults.add(createResult(result));
            } catch (Exception e) {
                errors.add("Student " + result.getStudentId() + ", Subject " + result.getSubjectCode() + ": " + e.getMessage());
            }
        }

        if (!errors.isEmpty()) {
            logger.warn("Bulk result entry had {} errors: {}", errors.size(), errors);
        }

        return savedResults;
    }

    /**
     * Update a result
     */
    public Result updateResult(Long id, Result details) {
        Result result = resultRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Result not found with id: " + id));

        // Check if exam is locked
        Exam exam = examRepository.findById(result.getExamId())
            .orElseThrow(() -> new RuntimeException("Associated exam not found"));

        if (exam.getIsLocked()) {
            throw new RuntimeException("Cannot update result. Exam is locked.");
        }

        // Update marks
        if (details.getPaper1Marks() != null) {
            result.setPaper1Marks(details.getPaper1Marks());
        }
        if (details.getPaper2Marks() != null) {
            result.setPaper2Marks(details.getPaper2Marks());
        }
        if (details.getPaper3Marks() != null) {
            result.setPaper3Marks(details.getPaper3Marks());
        }
        if (details.getMarksObtained() != null) {
            result.setMarksObtained(details.getMarksObtained());
        }

        // Recalculate total if paper marks exist
        if (result.getPaper1Marks() != null || result.getPaper2Marks() != null || result.getPaper3Marks() != null) {
            int total = 0;
            if (result.getPaper1Marks() != null) total += result.getPaper1Marks();
            if (result.getPaper2Marks() != null) total += result.getPaper2Marks();
            if (result.getPaper3Marks() != null) total += result.getPaper3Marks();
            result.setMarksObtained(total);
        }

        if (details.getMaxMarks() != null) {
            result.setMaxMarks(details.getMaxMarks());
        }
        if (details.getRemarks() != null) {
            result.setRemarks(details.getRemarks());
        }
        if (details.getIsPrincipal() != null) {
            result.setIsPrincipal(details.getIsPrincipal());
        }
        if (details.getIsSubsidiary() != null) {
            result.setIsSubsidiary(details.getIsSubsidiary());
        }

        // Recalculate grade
        result.calculateGrade();
        result.setModifiedBy(details.getModifiedBy());

        logger.info("Result updated - ID: {}, New Grade: {}", id, result.getGrade());
        return resultRepository.save(result);
    }

    /**
     * Delete a result
     */
    public void deleteResult(Long id) {
        Result result = resultRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Result not found with id: " + id));

        // Check if exam is locked
        Exam exam = examRepository.findById(result.getExamId())
            .orElseThrow(() -> new RuntimeException("Associated exam not found"));

        if (exam.getIsLocked()) {
            throw new RuntimeException("Cannot delete result. Exam is locked.");
        }

        resultRepository.deleteById(id);
        logger.info("Result deleted - ID: {}", id);
    }

    /**
     * Get all results
     */
    @Transactional(readOnly = true)
    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    /**
     * Get result by ID
     */
    @Transactional(readOnly = true)
    public Optional<Result> getResultById(Long id) {
        return resultRepository.findById(id);
    }

    /**
     * Get results by student ID
     */
    @Transactional(readOnly = true)
    public List<Result> getResultsByStudentId(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    /**
     * Get results by student and exam
     */
    @Transactional(readOnly = true)
    public List<Result> getResultsByStudentAndExam(Long studentId, Long examId) {
        return resultRepository.findByStudentIdAndExamId(studentId, examId);
    }

    /**
     * Get results by class (class_id)
     */
    @Transactional(readOnly = true)
    public List<Result> getResultsByClass(String className) {
        return resultRepository.findByClassName(className);
    }

    /**
     * Get results by class and exam
     */
    @Transactional(readOnly = true)
    public List<Result> getResultsByClassAndExam(String className, Long examId) {
        return resultRepository.findByClassNameAndExamId(className, examId);
    }

    /**
     * Get results by exam
     */
    @Transactional(readOnly = true)
    public List<Result> getResultsByExam(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    /**
     * Get student's report card for an exam
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getStudentReportCard(Long studentId, Long examId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new RuntimeException("Student not found"));

        Exam exam = examRepository.findById(examId)
            .orElseThrow(() -> new RuntimeException("Exam not found"));

        List<Result> results = resultRepository.findByStudentIdAndExamId(studentId, examId);

        Map<String, Object> reportCard = new HashMap<>();
        reportCard.put("studentId", student.getStudentId());
        reportCard.put("studentName", student.getFullName());
        reportCard.put("className", student.getCurrentClass());
        reportCard.put("stream", student.getStream());
        reportCard.put("examCode", exam.getCode());
        reportCard.put("examName", exam.getName());
        reportCard.put("academicYear", exam.getAcademicYear());
        reportCard.put("term", exam.getTerm());

        // Calculate aggregates for O-Level
        if (exam.getGradingScale() == Exam.GradingScale.O_LEVEL) {
            // Best 8 subjects aggregate
            List<Result> sortedResults = results.stream()
                .sorted(Comparator.comparingInt(Result::getGradePoints))
                .limit(8)
                .collect(Collectors.toList());

            int aggregate = sortedResults.stream()
                .mapToInt(Result::getGradePoints)
                .sum();

            reportCard.put("aggregate", aggregate);
            reportCard.put("aggregateGrade", getAggregateGrade(aggregate));
            reportCard.put("distinction", resultRepository.countDistinctions(studentId, examId));
            reportCard.put("credits", resultRepository.countCredits(studentId, examId));
            reportCard.put("passes", resultRepository.countPasses(studentId, examId));
            reportCard.put("failures", resultRepository.countFailures(studentId, examId));
        }

        // Calculate A-Level points
        if (exam.getGradingScale() == Exam.GradingScale.A_LEVEL) {
            int principalPoints = results.stream()
                .filter(Result::getIsPrincipal)
                .mapToInt(Result::getGradePoints)
                .sum();

            int subsidiaryPoints = results.stream()
                .filter(Result::getIsSubsidiary)
                .mapToInt(Result::getGradePoints)
                .sum();

            reportCard.put("principalPoints", principalPoints);
            reportCard.put("subsidiaryPoints", subsidiaryPoints);
            reportCard.put("totalPoints", principalPoints + subsidiaryPoints);
        }

        // Average
        Double average = resultRepository.getStudentAverageForExam(examId, studentId);
        reportCard.put("averagePercentage", average != null ? Math.round(average * 100.0) / 100.0 : 0);

        reportCard.put("totalSubjects", results.size());
        reportCard.put("results", results);

        return reportCard;
    }

    /**
     * Get grade distribution for a class in an exam
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGradeDistribution(Long examId, String subjectCode, String className) {
        List<Object[]> distribution = resultRepository.getGradeDistribution(examId, subjectCode, className);

        Map<String, Object> result = new HashMap<>();
        result.put("examId", examId);
        result.put("subjectCode", subjectCode);
        result.put("className", className);

        Map<String, Long> grades = new HashMap<>();
        for (Object[] row : distribution) {
            grades.put((String) row[0], (Long) row[1]);
        }
        result.put("gradeDistribution", grades);

        return result;
    }

    /**
     * Calculate and update positions for a class in an exam
     */
    public void calculatePositions(Long examId, String className) {
        List<Result> results = resultRepository.findByClassNameAndExamId(className, examId);

        // Group by subject
        Map<String, List<Result>> bySubject = results.stream()
            .collect(Collectors.groupingBy(Result::getSubjectCode));

        for (Map.Entry<String, List<Result>> entry : bySubject.entrySet()) {
            List<Result> subjectResults = entry.getValue();

            // Sort by marks descending
            subjectResults.sort((a, b) -> b.getMarksObtained().compareTo(a.getMarksObtained()));

            // Assign positions
            int position = 1;
            for (int i = 0; i < subjectResults.size(); i++) {
                if (i > 0 && !subjectResults.get(i).getMarksObtained()
                        .equals(subjectResults.get(i - 1).getMarksObtained())) {
                    position = i + 1;
                }
                subjectResults.get(i).setClassPosition(position);
            }

            resultRepository.saveAll(subjectResults);
        }

        logger.info("Positions calculated for class {} in exam {}", className, examId);
    }

    /**
     * Get Ugandan grading scale information
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getGradingScales() {
        Map<String, Object> scales = new HashMap<>();

        // O-Level grading (UCE)
        List<Map<String, Object>> oLevelGrades = List.of(
            createGradeInfo("D1", 80, 100, 1, "Distinction"),
            createGradeInfo("D2", 70, 79, 2, "Distinction"),
            createGradeInfo("C3", 65, 69, 3, "Credit"),
            createGradeInfo("C4", 60, 64, 4, "Credit"),
            createGradeInfo("C5", 55, 59, 5, "Credit"),
            createGradeInfo("C6", 50, 54, 6, "Credit"),
            createGradeInfo("P7", 40, 49, 7, "Pass"),
            createGradeInfo("P8", 34, 39, 8, "Pass"),
            createGradeInfo("F9", 0, 33, 9, "Fail")
        );
        scales.put("oLevel", oLevelGrades);

        // A-Level Principal grading (UACE)
        List<Map<String, Object>> aLevelPrincipalGrades = List.of(
            createGradeInfo("A", 80, 100, 6, "Excellent"),
            createGradeInfo("B", 70, 79, 5, "Very Good"),
            createGradeInfo("C", 60, 69, 4, "Good"),
            createGradeInfo("D", 50, 59, 3, "Satisfactory"),
            createGradeInfo("E", 40, 49, 2, "Pass"),
            createGradeInfo("O", 34, 39, 1, "Subsidiary Pass"),
            createGradeInfo("F", 0, 33, 0, "Fail")
        );
        scales.put("aLevelPrincipal", aLevelPrincipalGrades);

        // A-Level Subsidiary grading
        List<Map<String, Object>> aLevelSubsidiaryGrades = List.of(
            createGradeInfo("O", 50, 100, 1, "Pass"),
            createGradeInfo("F", 0, 49, 0, "Fail")
        );
        scales.put("aLevelSubsidiary", aLevelSubsidiaryGrades);

        // Aggregate interpretation for O-Level
        List<Map<String, Object>> aggregateInterpretation = List.of(
            createAggregateInfo("Division 1", 8, 32, "Excellent"),
            createAggregateInfo("Division 2", 33, 45, "Very Good"),
            createAggregateInfo("Division 3", 46, 58, "Good"),
            createAggregateInfo("Division 4", 59, 72, "Satisfactory"),
            createAggregateInfo("Fail", 73, 72, "Fail")
        );
        scales.put("aggregateInterpretation", aggregateInterpretation);

        return scales;
    }

    private Map<String, Object> createGradeInfo(String grade, int minMark, int maxMark, int points, String description) {
        Map<String, Object> info = new HashMap<>();
        info.put("grade", grade);
        info.put("minMark", minMark);
        info.put("maxMark", maxMark);
        info.put("points", points);
        info.put("description", description);
        return info;
    }

    private Map<String, Object> createAggregateInfo(String division, int minAggregate, int maxAggregate, String description) {
        Map<String, Object> info = new HashMap<>();
        info.put("division", division);
        info.put("minAggregate", minAggregate);
        info.put("maxAggregate", maxAggregate);
        info.put("description", description);
        return info;
    }

    private String getAggregateGrade(int aggregate) {
        if (aggregate >= 8 && aggregate <= 32) return "Division 1";
        if (aggregate >= 33 && aggregate <= 45) return "Division 2";
        if (aggregate >= 46 && aggregate <= 58) return "Division 3";
        if (aggregate >= 59 && aggregate <= 72) return "Division 4";
        return "Fail";
    }

    /**
     * Get overall result statistics
     */
    public Map<String, Object> getResultStatistics() {
        List<Result> allResults = resultRepository.findAll();

        Map<String, Object> stats = new HashMap<>();

        // Total results count
        stats.put("totalResults", allResults.size());

        // Count by grade
        Map<String, Long> gradeDistribution = allResults.stream()
            .collect(Collectors.groupingBy(Result::getGrade, Collectors.counting()));
        stats.put("gradeDistribution", gradeDistribution);

        // Average marks
        double avgMarks = allResults.stream()
            .mapToDouble(r -> r.getMarksObtained() != null ? r.getMarksObtained() : 0)
            .average()
            .orElse(0.0);
        stats.put("averageMarks", String.format("%.2f", avgMarks));

        // Highest marks
        int highestMarks = allResults.stream()
            .mapToInt(r -> r.getMarksObtained() != null ? r.getMarksObtained() : 0)
            .max()
            .orElse(0);
        stats.put("highestMarks", highestMarks);

        // Lowest marks
        int lowestMarks = allResults.stream()
            .mapToInt(r -> r.getMarksObtained() != null ? r.getMarksObtained() : 0)
            .min()
            .orElse(0);
        stats.put("lowestMarks", lowestMarks);

        // Results by academic year
        Map<String, Long> yearDistribution = allResults.stream()
            .collect(Collectors.groupingBy(Result::getAcademicYear, Collectors.counting()));
        stats.put("resultsByYear", yearDistribution);

        // Pass/Fail count
        long passCount = allResults.stream()
            .filter(r -> r.getGrade() != null && !r.getGrade().equals("F9") && !r.getGrade().equals("F"))
            .count();
        long failCount = allResults.size() - passCount;
        stats.put("passCount", passCount);
        stats.put("failCount", failCount);
        stats.put("passPercentage", allResults.size() > 0 
            ? String.format("%.2f%%", (passCount * 100.0) / allResults.size()) 
            : "0.00%");

        // Distinct subjects
        long distinctSubjects = allResults.stream()
            .map(Result::getSubjectCode)
            .distinct()
            .count();
        stats.put("distinctSubjects", distinctSubjects);

        // Distinct students
        long distinctStudents = allResults.stream()
            .map(Result::getStudentId)
            .distinct()
            .count();
        stats.put("distinctStudents", distinctStudents);

        logger.info("Result statistics retrieved - Total results: {}", allResults.size());

        return stats;
    }
}
