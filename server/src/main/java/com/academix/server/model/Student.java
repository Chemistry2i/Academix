package com.academix.server.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true, exclude = {"enrolledSubjects", "courseEnrollments", "results", "attendanceRecords", "schoolClass"})
@ToString(exclude = {"enrolledSubjects", "courseEnrollments", "results", "attendanceRecords", "schoolClass"})
@Entity
@Table(name = "students")
public class Student extends User {
    // Additional fields specific to students
    @Column(nullable = true, length = 20, unique = true)
    private String studentId; // Unique student identifier

    @Column(nullable = true, length = 20, unique = true)
    private String linn; // Learner Identification Number (LINN for students)
    
    @Column(nullable = true, length = 50)
    private String currentClass; // Current class or grade level
    
    @Column(nullable = true, length = 50)
    private String stream; // Stream or specialization (e.g., Science, Arts, Commerce, blue, active)
    
    @Column(nullable = true, length = 50)
    private String house; // House name for boarding students

    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ResidenceStatus residenceStatus; // DAY or BOARDING

    @Column(nullable = true, length = 200)
    private String combination; // Subject combination for students in higher classes (e.g., Math, Physics, Chemistry)

    // ============ RELATIONSHIPS ============

    // Current class relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_class_id")
    private SchoolClass schoolClass;

    // Subjects the student is enrolled in
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudentSubject> enrolledSubjects = new ArrayList<>();

    // Course enrollments (for A-Level)
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StudentCourse> courseEnrollments = new ArrayList<>();

    // Results
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id", insertable = false, updatable = false)
    private List<Result> results = new ArrayList<>();

    // Attendance records
    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", referencedColumnName = "id", insertable = false, updatable = false)
    private List<Attendance> attendanceRecords = new ArrayList<>();

    // Enum for residence status
    public enum ResidenceStatus {
        DAY, BOARDING
    }
}