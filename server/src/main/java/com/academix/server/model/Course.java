package com.academix.server.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Course/Subject Combination for Ugandan A-Level
 * In Uganda, A-Level students choose subject combinations (e.g., PCM, PCB, HEG)
 */
@Data
@EqualsAndHashCode(exclude = {"enrolledStudents", "classes"})
@ToString(exclude = {"enrolledStudents", "classes"})
@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Course code (e.g., "PCM", "PCB", "HEG", "MEG")
    @NotBlank(message = "Course code is required")
    @Column(nullable = false, unique = true, length = 10)
    private String code;

    // Full name (e.g., "Physics, Chemistry, Mathematics")
    @NotBlank(message = "Course name is required")
    @Column(nullable = false, length = 200)
    private String name;

    // Course type
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseType type;

    // Level
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CourseLevel level;

    // Principal subjects (3 for A-Level)
    @ElementCollection
    @CollectionTable(name = "course_principal_subjects", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "subject_code")
    private List<String> principalSubjects = new ArrayList<>();

    // Subsidiary subjects (typically 2 for A-Level: General Paper + 1 other)
    @ElementCollection
    @CollectionTable(name = "course_subsidiary_subjects", joinColumns = @JoinColumn(name = "course_id"))
    @Column(name = "subject_code")
    private List<String> subsidiarySubjects = new ArrayList<>();

    // Description
    @Column(length = 500)
    private String description;

    // Career paths this combination leads to
    @Column(length = 500)
    private String careerPaths;

    // Minimum requirements to join (e.g., "Credit in Physics, Mathematics at O-Level")
    @Column(length = 500)
    private String requirements;

    // Maximum students allowed (0 = unlimited)
    @Column(nullable = false)
    private Integer maxStudents = 0;

    // Current enrollment count
    @Column(nullable = false)
    private Integer currentEnrollment = 0;

    // Is active
    @Column(nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // ============ RELATIONSHIPS ============

    // Students enrolled in this course (A-Level)
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudentCourse> enrolledStudents = new ArrayList<>();

    // Classes offering this course
    @JsonIgnore
    @OneToMany(mappedBy = "course", fetch = FetchType.LAZY)
    private List<SchoolClass> classes = new ArrayList<>();

    // Enums
    public enum CourseType {
        SCIENCES,       // PCM, PCB, BCM
        ARTS,          // HEG, HEL, GEL
        TECHNICAL,     // Technical combinations
        MIXED          // Science + Arts combinations
    }

    public enum CourseLevel {
        O_LEVEL,
        A_LEVEL
    }

    // Helper methods
    public void addPrincipalSubject(String subjectCode) {
        if (this.principalSubjects == null) {
            this.principalSubjects = new ArrayList<>();
        }
        if (!this.principalSubjects.contains(subjectCode)) {
            this.principalSubjects.add(subjectCode);
        }
    }

    public void addSubsidiarySubject(String subjectCode) {
        if (this.subsidiarySubjects == null) {
            this.subsidiarySubjects = new ArrayList<>();
        }
        if (!this.subsidiarySubjects.contains(subjectCode)) {
            this.subsidiarySubjects.add(subjectCode);
        }
    }
}
