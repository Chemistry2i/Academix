package com.academix.server.model;

import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "timetables", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"class_name", "day_of_week", "period_number", "academic_year", "term"})
})
@Data
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Class name is required")
    @Column(name = "class_name", nullable = false)
    private String className;  // e.g., "S1A", "S2B", "S5 PCM"

    @Column(name = "stream")
    private String stream;  // e.g., "A", "B", "East", "West"

    @NotNull(message = "Day of week is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Period number is required")
    @Column(name = "period_number", nullable = false)
    private Integer periodNumber;  // 1-10 typically

    @Column(name = "period_name")
    private String periodName;  // e.g., "Period 1", "Morning Prep", "Break"

    @NotNull(message = "Start time is required")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @NotBlank(message = "Subject code is required")
    @Column(name = "subject_code", nullable = false)
    private String subjectCode;

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "teacher_id")
    private Long teacherId;

    @Column(name = "teacher_name")
    private String teacherName;

    @Column(name = "room")
    private String room;  // Classroom or lab

    @Column(name = "building")
    private String building;

    @NotBlank(message = "Academic year is required")
    @Column(name = "academic_year", nullable = false)
    private String academicYear;  // e.g., "2025/2026"

    @NotNull(message = "Term is required")
    @Column(name = "term", nullable = false)
    private Integer term;  // 1, 2, or 3

    @Enumerated(EnumType.STRING)
    @Column(name = "period_type")
    private PeriodType periodType = PeriodType.LESSON;

    @Column(name = "is_double_period")
    private Boolean isDoublePeriod = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "created_by")
    private Long createdBy;

    public enum DayOfWeek {
        MONDAY,
        TUESDAY,
        WEDNESDAY,
        THURSDAY,
        FRIDAY,
        SATURDAY,
        SUNDAY
    }

    public enum PeriodType {
        LESSON,          // Regular class
        MORNING_PREP,    // Early morning study
        BREAK,           // Short break
        LUNCH,           // Lunch break
        GAMES,           // Sports/PE
        ASSEMBLY,        // School assembly
        PRACTICAL,       // Lab practical
        LIBRARY,         // Library period
        CLUB,            // Club activities
        FREE_PERIOD,     // Free/Self-study
        EVENING_PREP     // Evening prep for boarding
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
     * Get duration in minutes
     */
    public int getDurationMinutes() {
        if (startTime != null && endTime != null) {
            return (int) java.time.Duration.between(startTime, endTime).toMinutes();
        }
        return 0;
    }

    /**
     * Check if this period conflicts with another
     */
    public boolean conflictsWith(Timetable other) {
        if (!this.dayOfWeek.equals(other.dayOfWeek)) {
            return false;
        }
        if (!this.academicYear.equals(other.academicYear) || !this.term.equals(other.term)) {
            return false;
        }
        // Check time overlap
        return !(this.endTime.isBefore(other.startTime) || this.startTime.isAfter(other.endTime));
    }
}
