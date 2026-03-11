package com.academix.server.model;

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