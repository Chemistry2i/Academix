package com.academix.server.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Exam entity for Ugandan secondary schools
 * Supports internal exams (BOT, MOT, EOT) and national exams (UCE, UACE)
 */
@Data
@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Exam code (e.g., "BOT1-2024-S1", "UCE-2024")
    @NotBlank(message = "Exam code is required")
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    // Exam name (e.g., "Beginning of Term 1 Examinations 2024")
    @NotBlank(message = "Exam name is required")
    @Column(nullable = false, length = 200)
    private String name;

    // Exam type
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamType type;

    // Academic year (e.g., "2024")
    @NotBlank(message = "Academic year is required")
    @Column(nullable = false, length = 10)
    private String academicYear;

    // Term (1, 2, or 3)
    @NotNull(message = "Term is required")
    @Column(nullable = false)
    private Integer term;

    // Target classes (e.g., ["S1", "S2", "S3", "S4"])
    @ElementCollection
    @CollectionTable(name = "exam_classes", joinColumns = @JoinColumn(name = "exam_id"))
    @Column(name = "class_name")
    private List<String> targetClasses = new ArrayList<>();

    // Target level
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamLevel level;

    // Start date
    @Column(nullable = false)
    private LocalDate startDate;

    // End date
    @Column(nullable = false)
    private LocalDate endDate;

    // Marks entry deadline
    @Column(nullable = true)
    private LocalDateTime marksEntryDeadline;

    // Exam status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ExamStatus status = ExamStatus.DRAFT;

    // Is this exam locked (no more marks entry)
    @Column(nullable = false)
    private Boolean isLocked = false;

    // Is results published
    @Column(nullable = false)
    private Boolean isPublished = false;

    // Published date
    @Column(nullable = true)
    private LocalDateTime publishedAt;

    // Published by (user ID)
    @Column(nullable = true)
    private Long publishedBy;

    // Description/Instructions
    @Column(length = 1000)
    private String description;

    // Grading scale to use (O_LEVEL or A_LEVEL)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GradingScale gradingScale;

    // Pass mark (default 34% for Uganda)
    @Column(nullable = false)
    private Integer passMark = 34;

    // Total marks possible
    @Column(nullable = false)
    private Integer totalMarks = 100;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // Enums for Ugandan exam system
    public enum ExamType {
        BOT,        // Beginning of Term
        MOT,        // Mid of Term
        EOT,        // End of Term
        MOCK,       // Mock Examinations (for S4 and S6)
        UCE,        // Uganda Certificate of Education (National O-Level)
        UACE,       // Uganda Advanced Certificate of Education (National A-Level)
        PROMOTIONAL, // Promotional Exams
        REMEDIAL,   // Remedial/Supplementary Exams
        CAT         // Continuous Assessment Test
    }

    public enum ExamLevel {
        O_LEVEL,    // S1-S4
        A_LEVEL,    // S5-S6
        ALL         // All classes
    }

    public enum ExamStatus {
        DRAFT,          // Being created
        SCHEDULED,      // Scheduled but not started
        IN_PROGRESS,    // Currently running
        COMPLETED,      // Exam completed, awaiting marks
        MARKS_ENTRY,    // Marks entry in progress
        LOCKED,         // Marks entry closed
        PUBLISHED       // Results published
    }

    public enum GradingScale {
        O_LEVEL,    // D1-F9 grading
        A_LEVEL,    // A-F grading
        PERCENTAGE  // Simple percentage
    }

    // Helper methods
    public void addClass(String className) {
        if (this.targetClasses == null) {
            this.targetClasses = new ArrayList<>();
        }
        if (!this.targetClasses.contains(className)) {
            this.targetClasses.add(className);
        }
    }

    public void lock() {
        this.isLocked = true;
        this.status = ExamStatus.LOCKED;
    }

    public void publish(Long userId) {
        this.isPublished = true;
        this.publishedAt = LocalDateTime.now();
        this.publishedBy = userId;
        this.status = ExamStatus.PUBLISHED;
    }
}
