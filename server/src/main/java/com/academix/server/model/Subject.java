package com.academix.server.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

/**
 * Subject entity for Ugandan secondary school curriculum
 * Supports both O-Level (S1-S4) and A-Level (S5-S6) subjects
 */
@Data
@EqualsAndHashCode(exclude = {"enrolledStudents", "assignedTeachers"})
@ToString(exclude = {"enrolledStudents", "assignedTeachers"})
@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Subject code (e.g., "MTH", "PHY", "ENG")
    @NotBlank(message = "Subject code is required")
    @Column(nullable = false, unique = true, length = 10)
    private String code;

    // Subject name (e.g., "Mathematics", "Physics")
    @NotBlank(message = "Subject name is required")
    @Column(nullable = false, length = 100)
    private String name;

    // Subject category
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubjectCategory category;

    // Level - O-Level, A-Level, or Both
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubjectLevel level;

    // Is this a core/compulsory subject?
    @Column(nullable = false)
    private Boolean isCompulsory = false;

    // Is this a science subject? (affects combination rules)
    @Column(nullable = false)
    private Boolean isScience = false;

    // Is this an arts subject?
    @Column(nullable = false)
    private Boolean isArts = false;

    // Paper count (some subjects have multiple papers), so we adding a paper count
    @Column(nullable = false)
    private Integer paperCount = 1;

    // Maximum marks per paper
    @Column(nullable = false)
    private Integer maxMarksPerPaper = 100;

    // Credit units (for weighting)
    @Column(nullable = false)
    private Integer creditUnits = 1;

    // Description
    @Column(length = 500)
    private String description;

    // Department offering the subject
    @Column(length = 100)
    private String department;

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

    // Students enrolled in this subject
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudentSubject> enrolledStudents = new ArrayList<>();

    // Teachers assigned to this subject
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TeacherSubject> assignedTeachers = new ArrayList<>();

    // Enums for Ugandan curriculum
    public enum SubjectCategory {
        LANGUAGES,           // English, Literature, Foreign Languages
        MATHEMATICS,         // Mathematics, Additional Mathematics
        SCIENCES,           // Physics, Chemistry, Biology
        HUMANITIES,         // History, Geography, Political Education
        RELIGIOUS_EDUCATION, // CRE, IRE
        TECHNICAL,          // Technical Drawing, Computer Studies
        VOCATIONAL,         // Agriculture, Entrepreneurship, Commerce
        CREATIVE_ARTS,      // Fine Art, Music
        PHYSICAL_EDUCATION  // PE
    }

    public enum SubjectLevel {
        O_LEVEL,    // S1-S4 (UCE)
        A_LEVEL,    // S5-S6 (UACE)
        BOTH        // Offered at both levels
    }
}
