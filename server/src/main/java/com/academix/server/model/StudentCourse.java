package com.academix.server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Join table for Student-Course (A-Level combination) relationship
 * Stores which course/combination a student is enrolled in
 */
@Data
@Entity
@Table(name = "student_courses", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "course_id", "academic_year"})
})
public class StudentCourse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    // Academic year of enrollment
    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    // Class level (S5 or S6)
    @Column(name = "class_level", length = 10)
    private String classLevel;

    // Enrollment status
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // Date enrolled
    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    // Date completed or transferred
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Notes
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EnrollmentStatus {
        ACTIVE,
        COMPLETED,
        DROPPED,
        TRANSFERRED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (enrolledAt == null) {
            enrolledAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
