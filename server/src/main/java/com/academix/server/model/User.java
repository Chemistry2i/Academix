package com.academix.server.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email"),
    @Index(name = "idx_user_nin", columnList = "nin")
})
@EntityListeners(AuditingEntityListener.class)
/* Joined the separate tables for student, staff, and admin etc
into one table called users to avoid redundancy and make it easier to manage user data. 
The specific role of each user will be determined by the role field in the database,
which can be used to differentiate between students, staff, and admins.
*/
@Inheritance(strategy=InheritanceType.JOINED)
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    @Column(nullable = false, length = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    @Column(nullable = false, length = 50)
    private String lastName;

    @Size(max = 100, message = "Other names must not exceed 100 characters")
    @Column(nullable = true, length = 100)
    private String otherNames;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email must not exceed 100 characters")
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank(message = "Password is required")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String password;

    @Pattern(regexp = "^[A-Z0-9]{14}$", message = "NIN must be 14 alphanumeric characters")
    @Column(nullable = true, unique = true, length = 14)
    private String nin;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    @Column(nullable = true, length = 20)
    private String phoneNumber;

    @Size(max = 100, message = "Disability status must not exceed 100 characters")
    @Column(nullable = true, length = 100)
    private String disabilityStatus;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    @Column(nullable = false, length = 10)
    private String gender;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    @Column(nullable = false)
    private LocalDate dateOfBirth;

    @Size(min = 1, max = 50, message = "Nationality must be between 1 and 50 characters")
    @Column(nullable = true, length = 50) 
    private String nationality;

    @Size(max = 500, message = "Profile picture URL must not exceed 500 characters")
    @Column(nullable = true, length = 500)
    private String profilePictureUrl;

    @Size(max = 500, message = "Birth certificate URL must not exceed 500 characters")
    @Column(nullable = true, length = 500)
    private String birthCertificateUrl;

    @Size(min = 1, max = 50, message = "District must be between 1 and 50 characters")
    @Column(nullable = true, length = 50)
    private String district;

    @Size(min = 1, max = 50, message = "County must be between 1 and 50 characters")
    @Column(nullable = true, length = 50)
    private String county;

    @Size(min = 1, max = 50, message = "Sub-county must be between 1 and 50 characters")
    @Column(nullable = true, length = 50)
    private String subCounty;

    @Size(min = 1, max = 50, message = "Parish must be between 1 and 50 characters")
    @Column(nullable = true, length = 50)
    private String parish;

    @Size(min = 1, max = 50, message = "Village must be between 1 and 50 characters")
    @Column(nullable = true, length = 50)
    private String village;

    // Audit fields
    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Column(nullable = false)
    private Boolean isDeleted = false;

    @Version
    private Long version;

    // Business methods
    public String getFullName() {
        StringBuilder fullName = new StringBuilder();
        fullName.append(firstName);
        if (otherNames != null && !otherNames.trim().isEmpty()) {
            fullName.append(" ").append(otherNames);
        }
        fullName.append(" ").append(lastName);
        return fullName.toString();
    }

    public String getFullAddress() {
        return String.format("%s, %s, %s, %s, %s", 
            village, parish, subCounty, county, district);
    }

    public void markAsDeleted() {
        this.isDeleted = true;
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
        this.isDeleted = false;
    }

    public void deactivate() {
        this.isActive = false;
    }
    // Password utility methods  
    public boolean checkPassword(String plainPassword) {
        return new BCryptPasswordEncoder(12).matches(plainPassword, this.password);
    }
    // Getters and setters are automatically generated by @Data annotation
}
