package com.academix.server.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;

/**
 * Represents a class/form in the school
 * e.g., S1A, S1B, S2 East, S5 PCM, etc.
 */
@Data
@Entity
@Table(name = "classes", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"name", "academic_year"})
})
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Class name (e.g., "S1A", "S2B", "S5 PCM")
    @Column(name = "name", nullable = false, length = 50)
    private String name;

    // Form/Year level (1-6 for S1-S6)
    @Column(name = "form_level", nullable = false)
    private Integer formLevel;

    // Stream name (e.g., "A", "B", "East", "West")
    @Column(name = "stream", length = 50)
    private String stream;

    // Level type
    @Enumerated(EnumType.STRING)
    @Column(name = "level_type", nullable = false)
    private LevelType levelType;

    // Course/combination for A-Level classes
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Course course;

    // Class teacher
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Teacher classTeacher;

    // Assistant class teacher
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assistant_teacher_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Teacher assistantClassTeacher;

    // Academic year
    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear;

    // Maximum capacity
    @Column(name = "max_capacity")
    private Integer maxCapacity = 50;

    // Current student count
    @Column(name = "current_count")
    private Integer currentCount = 0;

    // Classroom/Room assigned
    @Column(name = "classroom", length = 50)
    private String classroom;

    // Building
    @Column(name = "building", length = 100)
    private String building;

    // Is active
    @Column(name = "is_active")
    private Boolean isActive = true;

    // Notes
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum LevelType {
        O_LEVEL,    // S1-S4
        A_LEVEL     // S5-S6
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get display name (e.g., "Senior 1A", "S5 PCM")
     */
    public String getDisplayName() {
        if (levelType == LevelType.A_LEVEL && course != null) {
            return "S" + formLevel + " " + course.getCode();
        }
        return "S" + formLevel + (stream != null ? stream : "");
    }
}
