package com.academix.server.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
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

    // Document URLs specific to students
    @Column(nullable = true, length = 500)
    private String academicTranscriptUrl;
    
    @Column(nullable = true, length = 500)
    private String medicalCertificateUrl;
    
    @Column(nullable = true, length = 1000)
    private String otherDocumentUrls; // JSON array for additional student documents

    // Enum for residence status
    public enum ResidenceStatus {
        DAY, BOARDING
    }
}