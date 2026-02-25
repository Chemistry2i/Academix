package com.academix.server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Join table for Student-Subject many-to-many relationship
 * Stores which subjects a student is enrolled in
 */
@Data
@Entity
@Table(name = "student_subjects", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "subject_id"})
})
public class StudentSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // Is this a principal subject (for A-Level)?
    @Column(name = "is_principal")
    private Boolean isPrincipal = false;

    // Is this a subsidiary subject (for A-Level)?
    @Column(name = "is_subsidiary")
    private Boolean isSubsidiary = false;

    // Is this a compulsory subject for the student?
    @Column(name = "is_compulsory")
    private Boolean isCompulsory = false;

    // Academic year when enrolled
    @Column(name = "academic_year", length = 20)
    private String academicYear;

    // Term when enrolled
    @Column(name = "term")
    private Integer term;

    // Enrollment status
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EnrollmentStatus status = EnrollmentStatus.ACTIVE;

    // Date enrolled
    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    // Date dropped (if dropped)
    @Column(name = "dropped_at")
    private LocalDateTime droppedAt;

    // Reason for dropping (if dropped)
    @Column(name = "drop_reason", length = 500)
    private String dropReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EnrollmentStatus {
        ACTIVE,
        DROPPED,
        COMPLETED,
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
