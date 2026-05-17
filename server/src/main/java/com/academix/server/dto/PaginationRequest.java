package com.academix.server.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Request object for pagination parameters
 */
public class PaginationRequest {
    
    @JsonProperty("pageNumber")
    private int pageNumber = 0;
    
    @JsonProperty("pageSize")
    private int pageSize = 10;
    
    @JsonProperty("sortBy")
    private String sortBy = "id";
    
    @JsonProperty("sortDirection")
    private String sortDirection = "ASC"; // ASC or DESC

    // Constructors
    public PaginationRequest() {
    }

    public PaginationRequest(int pageNumber, int pageSize) {
        this.pageNumber = Math.max(0, pageNumber);
        this.pageSize = Math.max(1, Math.min(pageSize, 100)); // Max 100 items per page
    }

    public PaginationRequest(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        this.pageNumber = Math.max(0, pageNumber);
        this.pageSize = Math.max(1, Math.min(pageSize, 100));
        this.sortBy = sortBy != null ? sortBy : "id";
        this.sortDirection = sortDirection != null ? sortDirection : "ASC";
    }

    // Getters and Setters
    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = Math.max(0, pageNumber);
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = Math.max(1, Math.min(pageSize, 100));
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy != null ? sortBy : "id";
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection != null ? sortDirection : "ASC";
    }

    /**
     * Get the offset for database queries
     */
    public int getOffset() {
        return pageNumber * pageSize;
    }

    /**
     * Validate if sort direction is valid
     */
    public boolean isValidSortDirection() {
        return "ASC".equalsIgnoreCase(sortDirection) || "DESC".equalsIgnoreCase(sortDirection);
    }
}
