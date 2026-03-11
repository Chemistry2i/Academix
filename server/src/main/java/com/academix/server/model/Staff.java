package com.academix.server.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "staff")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Staff extends User {

    // Unique staff identifier (e.g., "STF001")
    @Column(nullable = true, length = 20, unique = true)
    private String staffId;

    // Department the staff member belongs to
    @NotBlank(message = "Department is required")
    @Size(min = 1, max = 100, message = "Department must be between 1 and 100 characters")
    @Column(nullable = false, length = 100)
    private String department;

    // Position or job title
    @NotBlank(message = "Position is required")
    @Size(min = 1, max = 100, message = "Position must be between 1 and 100 characters")
    @Column(nullable = false, length = 100)
    private String position;

    // Date when the staff member joined
    @Column(nullable = true)
    private LocalDate joinDate;

    // Employment status
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private StaffStatus status;

    // Salary information (optional)
    @Column(nullable = true)
    private Double salary;

    // Emergency contact name
    @Size(max = 100, message = "Emergency contact name must not exceed 100 characters")
    @Column(nullable = true, length = 100)
    private String emergencyContactName;

    // Emergency contact number
    @Size(max = 20, message = "Emergency contact number must not exceed 20 characters")
    @Column(nullable = true, length = 20)
    private String emergencyContactNumber;

    // Address
    @Size(max = 255, message = "Address must not exceed 255 characters")
    @Column(nullable = true, length = 255)
    private String address;

    // Employee contract type
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private ContractType contractType;

    // Qualification/Education level
    @Size(max = 100, message = "Qualification must not exceed 100 characters")
    @Column(nullable = true, length = 100)
    private String qualification;

    // Years of experience
    @Column(nullable = true)
    private Integer experience;

    // Enum for staff status
    public enum StaffStatus {
        ACTIVE("Active"),
        INACTIVE("Inactive"),
        ON_LEAVE("On Leave"),
        SUSPENDED("Suspended"),
        TERMINATED("Terminated");

        private final String displayName;

        StaffStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Enum for contract type
    public enum ContractType {
        PERMANENT("Permanent"),
        TEMPORARY("Temporary"),
        CONTRACT("Contract"),
        PART_TIME("Part Time"),
        INTERNSHIP("Internship");

        private final String displayName;

        ContractType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    // Helper methods
    public String getFullName() {
        StringBuilder name = new StringBuilder();
        name.append(getFirstName());
        
        if (getOtherNames() != null && !getOtherNames().trim().isEmpty()) {
            name.append(" ").append(getOtherNames());
        }
        
        name.append(" ").append(getLastName());
        return name.toString();
    }

    public String getStatusDisplayName() {
        return status != null ? status.getDisplayName() : "Unknown";
    }

    public String getContractDisplayName() {
        return contractType != null ? contractType.getDisplayName() : "Not Specified";
    }
}