package com.academix.server.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Generic paginated response wrapper for API responses
 */
public class PaginatedResponse<T> {
    
    @JsonProperty("data")
    private List<T> content;
    
    @JsonProperty("pageNumber")
    private int pageNumber;
    
    @JsonProperty("pageSize")
    private int pageSize;
    
    @JsonProperty("totalElements")
    private long totalElements;
    
    @JsonProperty("totalPages")
    private int totalPages;
    
    @JsonProperty("isFirst")
    private boolean isFirst;
    
    @JsonProperty("isLast")
    private boolean isLast;
    
    @JsonProperty("hasNext")
    private boolean hasNext;
    
    @JsonProperty("hasPrevious")
    private boolean hasPrevious;
    
    @JsonProperty("message")
    private String message;
    
    @JsonProperty("success")
    private boolean success;

    // Constructors
    public PaginatedResponse() {
        this.success = true;
    }

    public PaginatedResponse(List<T> content, int pageNumber, int pageSize, 
                            long totalElements, int totalPages, boolean isFirst, 
                            boolean isLast, String message) {
        this.content = content;
        this.pageNumber = pageNumber;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = totalPages;
        this.isFirst = isFirst;
        this.isLast = isLast;
        this.hasNext = !isLast;
        this.hasPrevious = !isFirst;
        this.message = message;
        this.success = true;
    }

    // Getters and Setters
    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getPageNumber() {
        return pageNumber;
    }

    public void setPageNumber(int pageNumber) {
        this.pageNumber = pageNumber;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return isFirst;
    }

    public void setFirst(boolean first) {
        isFirst = first;
    }

    public boolean isLast() {
        return isLast;
    }

    public void setLast(boolean last) {
        isLast = last;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public boolean isHasPrevious() {
        return hasPrevious;
    }

    public void setHasPrevious(boolean hasPrevious) {
        this.hasPrevious = hasPrevious;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }
}
