package com.academix.server.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "departments")
public class Department {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 100, message = "Department name must be between 2 and 100 characters")
    @Column(nullable = false, length = 100, unique = true)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    // Department head (proper JPA relationship)
    @OneToOne
    @JoinColumn(name = "head_teacher_id")
    private Teacher departmentHead;
    
    @Column(name = "head_appointed_date")
    private LocalDateTime headAppointedDate;
    
    @Column(name = "head_appointment_duration_months")
    private Integer headAppointmentDuration;
    
    @Min(value = 1950, message = "Establishment year must be >= 1950")
    @Column(name = "established_year")
    private Integer establishedYear;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepartmentStatus status = DepartmentStatus.ACTIVE;
    
    // Location/Building information
    @Column(length = 100)
    private String building;
    
    @Column(length = 50)
    private String floor;
    
    @Column(length = 100)
    private String officeRoom;
    
    // Contact information
    @Column(length = 20)
    private String phoneNumber;
    
    @Column(length = 100)
    private String email;
    
    // Academic information
    @Column(name = "department_code", length = 10, unique = true)
    private String departmentCode;
    
    @Column(name = "academic_focus", length = 200)
    private String academicFocus;
    
    @Column(name = "vision_statement", length = 500)
    private String visionStatement;
    
    @Column(name = "mission_statement", length = 500)
    private String missionStatement;
    
    // Capacity and targets
    @Column(name = "target_enrollment")
    private Integer targetEnrollment;
    
    @Column(name = "minimum_staff")
    private Integer minimumStaff;
    
    @Column(name = "is_core_department")
    private Boolean isCoreDepartment = true;
    
    // Timestamps
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Staff> staff = new ArrayList<>();
    
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Teacher> teachers = new ArrayList<>();
    
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Subject> subjects = new ArrayList<>();
    
    // Default constructor
    public Department() {}
    
    // Constructor with required fields
    public Department(String name, String description, Integer establishedYear) {
        this.name = name;
        this.description = description;
        this.establishedYear = establishedYear;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Teacher getDepartmentHead() {
        return departmentHead;
    }
    
    public void setDepartmentHead(Teacher departmentHead) {
        this.departmentHead = departmentHead;
    }
    
    public LocalDateTime getHeadAppointedDate() {
        return headAppointedDate;
    }
    
    public void setHeadAppointedDate(LocalDateTime headAppointedDate) {
        this.headAppointedDate = headAppointedDate;
    }
    
    public Integer getHeadAppointmentDuration() {
        return headAppointmentDuration;
    }
    
    public void setHeadAppointmentDuration(Integer headAppointmentDuration) {
        this.headAppointmentDuration = headAppointmentDuration;
    }
    
    public String getDepartmentCode() {
        return departmentCode;
    }
    
    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }
    
    public String getAcademicFocus() {
        return academicFocus;
    }
    
    public void setAcademicFocus(String academicFocus) {
        this.academicFocus = academicFocus;
    }
    
    public String getVisionStatement() {
        return visionStatement;
    }
    
    public void setVisionStatement(String visionStatement) {
        this.visionStatement = visionStatement;
    }
    
    public String getMissionStatement() {
        return missionStatement;
    }
    
    public void setMissionStatement(String missionStatement) {
        this.missionStatement = missionStatement;
    }
    
    public Integer getTargetEnrollment() {
        return targetEnrollment;
    }
    
    public void setTargetEnrollment(Integer targetEnrollment) {
        this.targetEnrollment = targetEnrollment;
    }
    
    public Integer getMinimumStaff() {
        return minimumStaff;
    }
    
    public void setMinimumStaff(Integer minimumStaff) {
        this.minimumStaff = minimumStaff;
    }
    
    public Boolean getIsCoreDepartment() {
        return isCoreDepartment;
    }
    
    public void setIsCoreDepartment(Boolean isCoreDepartment) {
        this.isCoreDepartment = isCoreDepartment;
    }
    
    public Integer getEstablishedYear() {
        return establishedYear;
    }
    
    public void setEstablishedYear(Integer establishedYear) {
        this.establishedYear = establishedYear;
    }
    
    public DepartmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(DepartmentStatus status) {
        this.status = status;
    }
    
    public String getBuilding() {
        return building;
    }
    
    public void setBuilding(String building) {
        this.building = building;
    }
    
    public String getFloor() {
        return floor;
    }
    
    public void setFloor(String floor) {
        this.floor = floor;
    }
    
    public String getOfficeRoom() {
        return officeRoom;
    }
    
    public void setOfficeRoom(String officeRoom) {
        this.officeRoom = officeRoom;
    }
    
    public String getPhoneNumber() {
        return phoneNumber;
    }
    
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    

    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public List<Staff> getStaff() {
        return staff;
    }
    
    public void setStaff(List<Staff> staff) {
        this.staff = staff;
    }
    
    public List<Teacher> getTeachers() {
        return teachers;
    }
    
    public void setTeachers(List<Teacher> teachers) {
        this.teachers = teachers;
    }
    
    public List<Subject> getSubjects() {
        return subjects;
    }
    
    public void setSubjects(List<Subject> subjects) {
        this.subjects = subjects;
    }
    
    // Convenience methods for counts
    public int getTeacherCount() {
        return teachers != null ? teachers.size() : 0;
    }
    
    public int getSubjectCount() {
        return subjects != null ? subjects.size() : 0;
    }
    
    public int getStaffCount() {
        return staff != null ? staff.size() : 0;
    }
    
    // Get total students count across all subjects
    public int getStudentCount() {
        // This will be calculated by the service layer
        // using the SubjectRepository query
        return 0;
    }
    
    @Override
    public String toString() {
        return "Department{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", departmentCode='" + departmentCode + '\'' +
                ", departmentHead=" + (departmentHead != null ? departmentHead.getFullName() : "None") +
                ", establishedYear=" + establishedYear +
                ", status=" + status +
                '}';
    }
    
    // Helper methods for professional operations
    public String getHeadTeacherName() {
        return departmentHead != null ? departmentHead.getFullName() : "Not Assigned";
    }
    
    public Long getHeadTeacherId() {
        return departmentHead != null ? departmentHead.getId() : null;
    }
    
    public boolean hasHead() {
        return departmentHead != null;
    }
    
    public boolean isHeadAppointmentExpired() {
        if (headAppointedDate == null || headAppointmentDuration == null) {
            return false;
        }
        return headAppointedDate.plusMonths(headAppointmentDuration).isBefore(LocalDateTime.now());
    }
}