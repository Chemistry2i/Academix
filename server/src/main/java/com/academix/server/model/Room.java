package com.academix.server.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Entity
@Table(name = "rooms")
@Data
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Room number is required")
    @Column(name = "room_number", unique = true, nullable = false)
    private String roomNumber;

    @Column(name = "room_name")
    private String roomName;

    @NotBlank(message = "Room type is required")
    @Column(name = "room_type", nullable = false)
    private String roomType; // CLASSROOM, LABORATORY, LIBRARY, HALL, OFFICE

    @Column(name = "capacity")
    private Integer capacity;

    @Column(name = "location")
    private String location;

    @Column(name = "building")
    private String building;

    @Column(name = "floor")
    private String floor;

    @Column(name = "equipment")
    private String equipment; // JSON string of available equipment

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "notes")
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isAvailable == null) {
            isAvailable = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}