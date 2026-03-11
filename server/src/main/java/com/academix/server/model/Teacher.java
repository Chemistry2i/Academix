package com.academix.server.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@EqualsAndHashCode(callSuper = true, exclude = {"subjectAssignments", "classesAsTeacher"})
@ToString(exclude = {"subjectAssignments", "classesAsTeacher"})
@Entity
@Table(name = "teachers")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Teacher extends User {

    // Unique teacher/staff identifier (e.g., "TCH2024001")
    @Column(nullable = true, length = 20, unique = true)
    private String teacherId;

    // Teacher's registration number (if applicable)
    @Column(nullable = true, length = 50, unique = true)
    private String registrationNumber;

    // Employment type
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private EmploymentType employmentType;

    // Employment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private EmploymentStatus employmentStatus;

    // Date joined the school
    @Column(nullable = true)
    private LocalDate dateJoined;

    // Date of contract end (for contract teachers)
    @Column(nullable = true)
    private LocalDate contractEndDate;

    // Department name input (used for create/update; resolved to a Department entity in the service)
    @Transient
    @JsonProperty("departmentName")
    private String departmentName;

    // Department relationship (member of department)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    // Department headed by this teacher
    @OneToOne(mappedBy = "departmentHead", cascade = CascadeType.ALL)
    private Department headedDepartment;

    // Primary subject taught
    @Column(nullable = true, length = 100)
    private String primarySubject;

    // List of subjects the teacher can teach
    @ElementCollection
    @CollectionTable(name = "teacher_subjects", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "subject")
    private List<String> subjects = new ArrayList<>();

    // List of classes assigned to the teacher
    @ElementCollection
    @CollectionTable(name = "teacher_classes", joinColumns = @JoinColumn(name = "teacher_id"))
    @Column(name = "class_name")
    private List<String> assignedClasses = new ArrayList<>();

    // Qualifications (e.g., "Bachelor of Education, Master of Science")
    @Column(nullable = true, length = 500)
    private String qualifications;

    // Specialization area
    @Column(nullable = true, length = 200)
    private String specialization;

    // Years of experience
    @Column(nullable = true)
    private Integer yearsOfExperience;

    // Is class teacher (form master/mistress)
    @Column(nullable = false)
    private Boolean isClassTeacher = false;

    // Class they are responsible for (if class teacher)
    @Column(nullable = true, length = 50)
    private String classResponsibility;

    // Is department head
    @Column(nullable = false)
    private Boolean isDepartmentHead = false;

    // Bank account details for salary
    @Column(nullable = true, length = 100)
    private String bankName;

    @Column(nullable = true, length = 50)
    private String bankAccountNumber;

    // Emergency contact
    @Column(nullable = true, length = 100)
    private String emergencyContactName;

    @Column(nullable = true, length = 20)
    private String emergencyContactPhone;

    @Column(nullable = true, length = 50)
    private String emergencyContactRelationship;

    // Salary grade/scale
    @Column(nullable = true, length = 50)
    private String salaryGrade;

    // Notes/remarks
    @Column(nullable = true, length = 1000)
    private String notes;

    // ============ RELATIONSHIPS ============

    // Subject assignments (proper many-to-many via join entity)
    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore // Prevent circular reference during JSON serialization
    private List<TeacherSubject> subjectAssignments = new ArrayList<>();

    // Classes where this teacher is the class teacher
    @OneToMany(mappedBy = "classTeacher", fetch = FetchType.LAZY)
    @JsonIgnore // Prevent circular reference during JSON serialization
    private List<SchoolClass> classesAsTeacher = new ArrayList<>();

    // Enums
    public enum EmploymentType {
        PERMANENT,
        CONTRACT,
        PART_TIME,
        INTERN,
        VOLUNTEER
    }

    public enum EmploymentStatus {
        ACTIVE,
        ON_LEAVE,
        SUSPENDED,
        TERMINATED,
        RETIRED,
        RESIGNED
    }

    // Helper methods
    public void addSubject(String subject) {
        if (this.subjects == null) {
            this.subjects = new ArrayList<>();
        }
        if (!this.subjects.contains(subject)) {
            this.subjects.add(subject);
        }
    }

    public void removeSubject(String subject) {
        if (this.subjects != null) {
            this.subjects.remove(subject);
        }
    }

    public void addClass(String className) {
        if (this.assignedClasses == null) {
            this.assignedClasses = new ArrayList<>();
        }
        if (!this.assignedClasses.contains(className)) {
            this.assignedClasses.add(className);
        }
    }

    public void removeClass(String className) {
        if (this.assignedClasses != null) {
            this.assignedClasses.remove(className);
        }
    }
}
