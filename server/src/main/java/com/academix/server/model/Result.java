package com.academix.server.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Result entity for storing student exam results
 * Follows Ugandan grading system for O-Level and A-Level
 */
@Data
@Entity
@Table(name = "results", indexes = {
    @Index(name = "idx_result_student", columnList = "student_id"),
    @Index(name = "idx_result_exam", columnList = "exam_id"),
    @Index(name = "idx_result_class", columnList = "class_name"),
    @Index(name = "idx_result_subject", columnList = "subject_code")
})
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Student ID (reference to Student entity)
    @NotNull(message = "Student ID is required")
    @Column(name = "student_id", nullable = false)
    private Long studentId;

    // Student's registration number (for easy reference)
    @Column(name = "student_number", nullable = true, length = 20)
    private String studentNumber;

    // Exam ID (reference to Exam entity)
    @NotNull(message = "Exam ID is required")
    @Column(name = "exam_id", nullable = false)
    private Long examId;

    // Exam code (for easy reference)
    @Column(name = "exam_code", nullable = true, length = 50)
    private String examCode;

    // Subject code
    @Column(name = "subject_code", nullable = false, length = 10)
    private String subjectCode;

    // Subject name (for easy reference)
    @Column(name = "subject_name", nullable = true, length = 100)
    private String subjectName;

    // Class/Form (e.g., "S1", "S4", "S6")
    @Column(name = "class_name", nullable = false, length = 20)
    private String className;

    // Stream (if applicable)
    @Column(nullable = true, length = 50)
    private String stream;

    // Academic year
    @Column(nullable = false, length = 10)
    private String academicYear;

    // Term
    @Column(nullable = false)
    private Integer term;

    // Individual paper marks (for subjects with multiple papers)
    @Column(nullable = true)
    private Integer paper1Marks;

    @Column(nullable = true)
    private Integer paper2Marks;

    @Column(nullable = true)
    private Integer paper3Marks;

    // Total marks obtained
    @Column(nullable = false)
    private Integer marksObtained = 0;

    // Maximum possible marks
    @Column(nullable = false)
    private Integer maxMarks = 100;

    // Percentage score
    @Column(nullable = false)
    private Double percentage = 0.0;

    // Grade (e.g., "D1", "C3", "A", "B")
    @Column(nullable = false, length = 5)
    private String grade;

    // Grade points (for aggregates calculation)
    @Column(nullable = false)
    private Integer gradePoints = 0;

    // Remarks
    @Column(length = 200)
    private String remarks;

    // Position in class for this subject
    @Column(nullable = true)
    private Integer classPosition;

    // Position in stream for this subject
    @Column(nullable = true)
    private Integer streamPosition;

    // Grading scale used
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradingScaleType gradingScale;

    // Is this a principal subject (A-Level)
    @Column(nullable = false)
    private Boolean isPrincipal = false;

    // Is this a subsidiary subject (A-Level)
    @Column(nullable = false)
    private Boolean isSubsidiary = false;

    // Teacher who entered marks
    @Column(nullable = true)
    private Long enteredBy;

    // Entry timestamp
    @Column(nullable = true)
    private LocalDateTime enteredAt;

    // Last modified by
    @Column(nullable = true)
    private Long modifiedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Grading scale types
    public enum GradingScaleType {
        O_LEVEL,    // D1-F9
        A_LEVEL,    // A-F for principals, O-F for subsidiaries
        PERCENTAGE  // Simple percentage
    }

    /**
     * Calculate grade and points based on Ugandan O-Level grading
     * D1: 80-100 (1 point)
     * D2: 70-79  (2 points)
     * C3: 65-69  (3 points)
     * C4: 60-64  (4 points)
     * C5: 55-59  (5 points)
     * C6: 50-54  (6 points)
     * P7: 40-49  (7 points)
     * P8: 34-39  (8 points)
     * F9: 0-33   (9 points - Fail)
     */
    public void calculateOLevelGrade() {
        this.percentage = (this.marksObtained * 100.0) / this.maxMarks;
        int pct = (int) Math.round(this.percentage);

        if (pct >= 80) {
            this.grade = "D1";
            this.gradePoints = 1;
            this.remarks = "Distinction";
        } else if (pct >= 70) {
            this.grade = "D2";
            this.gradePoints = 2;
            this.remarks = "Distinction";
        } else if (pct >= 65) {
            this.grade = "C3";
            this.gradePoints = 3;
            this.remarks = "Credit";
        } else if (pct >= 60) {
            this.grade = "C4";
            this.gradePoints = 4;
            this.remarks = "Credit";
        } else if (pct >= 55) {
            this.grade = "C5";
            this.gradePoints = 5;
            this.remarks = "Credit";
        } else if (pct >= 50) {
            this.grade = "C6";
            this.gradePoints = 6;
            this.remarks = "Credit";
        } else if (pct >= 40) {
            this.grade = "P7";
            this.gradePoints = 7;
            this.remarks = "Pass";
        } else if (pct >= 34) {
            this.grade = "P8";
            this.gradePoints = 8;
            this.remarks = "Pass";
        } else {
            this.grade = "F9";
            this.gradePoints = 9;
            this.remarks = "Fail";
        }
    }

    /**
     * Calculate grade for A-Level Principal subjects
     * A: 80-100 (6 points)
     * B: 70-79  (5 points)
     * C: 60-69  (4 points)
     * D: 50-59  (3 points)
     * E: 40-49  (2 points)
     * O: 34-39  (1 point - Subsidiary pass)
     * F: 0-33   (0 points - Fail)
     */
    public void calculateALevelPrincipalGrade() {
        this.percentage = (this.marksObtained * 100.0) / this.maxMarks;
        int pct = (int) Math.round(this.percentage);

        if (pct >= 80) {
            this.grade = "A";
            this.gradePoints = 6;
            this.remarks = "Excellent";
        } else if (pct >= 70) {
            this.grade = "B";
            this.gradePoints = 5;
            this.remarks = "Very Good";
        } else if (pct >= 60) {
            this.grade = "C";
            this.gradePoints = 4;
            this.remarks = "Good";
        } else if (pct >= 50) {
            this.grade = "D";
            this.gradePoints = 3;
            this.remarks = "Satisfactory";
        } else if (pct >= 40) {
            this.grade = "E";
            this.gradePoints = 2;
            this.remarks = "Pass";
        } else if (pct >= 34) {
            this.grade = "O";
            this.gradePoints = 1;
            this.remarks = "Subsidiary Pass";
        } else {
            this.grade = "F";
            this.gradePoints = 0;
            this.remarks = "Fail";
        }
    }

    /**
     * Calculate grade for A-Level Subsidiary subjects
     * O: 50-100 (1 point - Pass)
     * F: 0-49   (0 points - Fail)
     */
    public void calculateALevelSubsidiaryGrade() {
        this.percentage = (this.marksObtained * 100.0) / this.maxMarks;
        int pct = (int) Math.round(this.percentage);

        if (pct >= 50) {
            this.grade = "O";
            this.gradePoints = 1;
            this.remarks = "Pass";
        } else {
            this.grade = "F";
            this.gradePoints = 0;
            this.remarks = "Fail";
        }
    }

    /**
     * Auto-calculate grade based on grading scale
     */
    public void calculateGrade() {
        if (this.gradingScale == GradingScaleType.O_LEVEL) {
            calculateOLevelGrade();
        } else if (this.gradingScale == GradingScaleType.A_LEVEL) {
            if (this.isSubsidiary) {
                calculateALevelSubsidiaryGrade();
            } else {
                calculateALevelPrincipalGrade();
            }
        } else {
            // Simple percentage
            this.percentage = (this.marksObtained * 100.0) / this.maxMarks;
            this.grade = String.format("%.0f%%", this.percentage);
            this.gradePoints = (int) Math.round(this.percentage / 10);
        }
    }
}
