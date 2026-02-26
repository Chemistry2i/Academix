package com.academix.server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Join table for Teacher-Subject many-to-many relationship
 * Stores which subjects a teacher can teach
 */
@Data
@Entity
@Table(name = "teacher_subject_assignments", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"teacher_id", "subject_id"})
})
public class TeacherSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    // Is this the teacher's primary/main subject?
    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    // Is the teacher certified to teach this subject?
    @Column(name = "is_certified")
    private Boolean isCertified = true;

    // Which classes does this teacher teach this subject to?
    @Column(name = "assigned_classes", length = 500)
    private String assignedClasses; // Comma-separated class names

    // Academic year of assignment
    @Column(name = "academic_year", length = 20)
    private String academicYear;

    // Assignment status
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    // Date assigned
    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    // Notes
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AssignmentStatus {
        ACTIVE,
        INACTIVE,
        ON_LEAVE,
        TRANSFERRED
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (assignedAt == null) {
            assignedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
