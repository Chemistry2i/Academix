package com.academix.server.util;

import java.util.List;
import org.springframework.data.domain.Page;
import com.academix.server.dto.PaginatedResponse;

/**
 * Utility class for pagination operations
 */
public class PaginationUtils {

    /**
     * Convert Spring Data Page to PaginatedResponse
     */
    public static <T> PaginatedResponse<T> toPagedResponse(Page<T> page, String message) {
        return new PaginatedResponse<>(
            page.getContent(),
            page.getNumber(),
            page.getSize(),
            page.getTotalElements(),
            page.getTotalPages(),
            page.isFirst(),
            page.isLast(),
            message != null ? message : "Data retrieved successfully"
        );
    }

    /**
     * Convert Spring Data Page to PaginatedResponse with default message
     */
    public static <T> PaginatedResponse<T> toPagedResponse(Page<T> page) {
        return toPagedResponse(page, "Data retrieved successfully");
    }

    /**
     * Create PaginatedResponse from manual pagination
     */
    public static <T> PaginatedResponse<T> toPagedResponse(
            List<T> content, 
            int pageNumber, 
            int pageSize, 
            long totalElements, 
            String message) {
        
        int totalPages = (int) Math.ceil((double) totalElements / pageSize);
        boolean isFirst = pageNumber == 0;
        boolean isLast = pageNumber >= totalPages - 1;

        return new PaginatedResponse<>(
            content,
            pageNumber,
            pageSize,
            totalElements,
            totalPages,
            isFirst,
            isLast,
            message != null ? message : "Data retrieved successfully"
        );
    }

    /**
     * Create PaginatedResponse from manual pagination with default message
     */
    public static <T> PaginatedResponse<T> toPagedResponse(
            List<T> content, 
            int pageNumber, 
            int pageSize, 
            long totalElements) {
        return toPagedResponse(content, pageNumber, pageSize, totalElements, null);
    }

    /**
     * Get offset for database limit/offset queries
     */
    public static int getOffset(int pageNumber, int pageSize) {
        return pageNumber * pageSize;
    }

    /**
     * Validate pagination parameters
     */
    public static boolean isValidPaginationParams(int pageNumber, int pageSize) {
        return pageNumber >= 0 && pageSize > 0 && pageSize <= 100;
    }
}
