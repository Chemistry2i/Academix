package com.academix.server.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "attendance", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"student_id", "date", "session_type"})
})
@Data
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Student ID is required")
    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "student_number")
    private String studentNumber;

    @Column(name = "student_name")
    private String studentName;

    @NotNull(message = "Class name is required")
    @Column(name = "class_name", nullable = false)
    private String className;

    @Column(name = "stream")
    private String stream;

    @NotNull(message = "Date is required")
    @Column(name = "date", nullable = false)
    private LocalDate date;

    @NotNull(message = "Status is required")
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AttendanceStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "session_type")
    private SessionType sessionType = SessionType.FULL_DAY;

    @Column(name = "check_in_time")
    private LocalTime checkInTime;

    @Column(name = "check_out_time")
    private LocalTime checkOutTime;

    @Column(name = "subject_code")
    private String subjectCode;  // For subject-specific attendance

    @Column(name = "subject_name")
    private String subjectName;

    @Column(name = "period_number")
    private Integer periodNumber;  // Which period of the day

    @Column(name = "academic_year", nullable = false)
    private String academicYear;

    @Column(name = "term", nullable = false)
    private Integer term;

    @Column(name = "week_number")
    private Integer weekNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "absence_reason")
    private AbsenceReason absenceReason;

    @Column(name = "absence_note", length = 500)
    private String absenceNote;

    @Column(name = "is_excused")
    private Boolean isExcused = false;

    @Column(name = "parent_notified")
    private Boolean parentNotified = false;

    @Column(name = "parent_notified_at")
    private LocalDateTime parentNotifiedAt;

    @Column(name = "marked_by")
    private Long markedBy;  // Teacher/Admin who marked

    @Column(name = "marked_by_name")
    private String markedByName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "modified_by")
    private Long modifiedBy;

    public enum AttendanceStatus {
        PRESENT,
        ABSENT,
        LATE,
        EARLY_DEPARTURE,
        HALF_DAY,
        SICK,
        PERMISSION,
        SUSPENDED,
        ON_LEAVE
    }

    public enum SessionType {
        FULL_DAY,
        MORNING,
        AFTERNOON,
        SPECIFIC_PERIOD,
        ASSEMBLY,
        GAMES,
        PREP
    }

    public enum AbsenceReason {
        SICKNESS,
        FAMILY_EMERGENCY,
        MEDICAL_APPOINTMENT,
        PERMISSION_GRANTED,
        SUSPENSION,
        SCHOOL_ACTIVITY,
        EXAM_LEAVE,
        FUNERAL,
        RELIGIOUS_OBSERVANCE,
        UNKNOWN,
        OTHER
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
     * Check if student was present (includes late arrivals)
     */
    public boolean wasPresent() {
        return status == AttendanceStatus.PRESENT || 
               status == AttendanceStatus.LATE ||
               status == AttendanceStatus.EARLY_DEPARTURE ||
               status == AttendanceStatus.HALF_DAY;
    }

    /**
     * Check if absence is justified
     */
    public boolean isJustifiedAbsence() {
        return isExcused || 
               status == AttendanceStatus.SICK ||
               status == AttendanceStatus.PERMISSION ||
               status == AttendanceStatus.ON_LEAVE;
    }
}
