package com.academix.server.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

/**
 * Enum representing the status of academic departments
 */
public enum DepartmentStatus {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended");
    
    private final String displayName;
    
    DepartmentStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }

    @JsonValue
    public String toJson() {
        return displayName;
    }
    
    /**
     * Get enum value from display name
     */
    public static DepartmentStatus fromDisplayName(String displayName) {
        for (DepartmentStatus status : values()) {
            if (status.displayName.equalsIgnoreCase(displayName)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No DepartmentStatus with display name: " + displayName);
    }

    /**
     * Accepts both enum names (ACTIVE) and display names (Active).
     */
    @JsonCreator
    public static DepartmentStatus fromJson(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        String normalized = value.trim();

        for (DepartmentStatus status : values()) {
            if (status.name().equalsIgnoreCase(normalized) || status.displayName.equalsIgnoreCase(normalized)) {
                return status;
            }
        }

        String enumLike = normalized
            .replace('-', '_')
            .replace(' ', '_')
            .toUpperCase(Locale.ROOT);

        try {
            return DepartmentStatus.valueOf(enumLike);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid DepartmentStatus value: " + value +
                ". Allowed values: ACTIVE, INACTIVE, SUSPENDED (or Active, Inactive, Suspended)");
        }
    }
    
    /**
     * Check if status is active
     */
    public boolean isActive() {
        return this == ACTIVE;
    }
    
    @Override
    public String toString() {
        return displayName;
    }
}