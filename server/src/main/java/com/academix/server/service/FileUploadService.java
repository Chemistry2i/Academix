package com.academix.server.service;

import com.academix.server.dto.FileUploadDTOs.*;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service for handling file uploads to Cloudinary
 * Supports images, videos, and documents with proper organization
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final Cloudinary cloudinary;
    
    // Allowed file types for different categories
    private static final Set<String> IMAGE_TYPES = Set.of("jpg", "jpeg", "png", "gif", "webp", "bmp");
    private static final Set<String> DOCUMENT_TYPES = Set.of("pdf", "doc", "docx", "txt", "rtf");
    private static final Set<String> VIDEO_TYPES = Set.of("mp4", "avi", "mov", "wmv", "flv", "webm");
    
    /**
     * Upload a file to Cloudinary with proper organization
     */
    public FileUploadResponse uploadFile(MultipartFile file, String userId, FileType fileType, String description) {
        try {
            // Validate file
            String validationError = validateFile(file, fileType);
            if (validationError != null) {
                return new FileUploadResponse(false, validationError);
            }

            // Determine resource type
            String resourceType = determineResourceType(file);
            
            // Create folder structure: academix/{user_type}/{user_id}/{file_type}
            String folder = String.format("academix/users/%s/%s", userId, fileType.getCode());
            
            // Upload options
            Map<String, Object> uploadOptions = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", resourceType,
                "public_id", generatePublicId(userId, fileType),
                "overwrite", true, // Allow overwriting same file type
                "faces", true, // Enable face detection for profile pictures
                "colors", true, // Extract dominant colors
                "use_filename", true,
                "unique_filename", true
            );

            // Add image-specific transformations
            if ("image".equals(resourceType)) {
                uploadOptions.put("transformation", Arrays.asList(
                    ObjectUtils.asMap("quality", "auto:best"), // Auto quality optimization
                    ObjectUtils.asMap("fetch_format", "auto")  // Auto format selection
                ));
            }

            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadOptions);
            
            // Create response
            FileInfo fileInfo = createFileInfo(uploadResult, file.getOriginalFilename(), description);
            FileUploadResponse response = new FileUploadResponse(true, "File uploaded successfully");
            response.setFileInfo(fileInfo);
            
            log.info("File uploaded successfully: {} for user: {}", fileType.getDisplayName(), userId);
            return response;
            
        } catch (IOException e) {
            log.error("Failed to upload file for user: {}, type: {}", userId, fileType, e);
            return new FileUploadResponse(false, "Upload failed: " + e.getMessage());
        }
    }

    /**
     * Delete a file from Cloudinary
     */
    public FileDeleteResponse deleteFile(String publicId, String resourceType) {
        try {
            Map<String, Object> deleteOptions = ObjectUtils.asMap("resource_type", resourceType);
            Map<String, Object> deleteResult = cloudinary.uploader().destroy(publicId, deleteOptions);
            
            String result = (String) deleteResult.get("result");
            boolean success = "ok".equals(result);
            
            String message = success ? "File deleted successfully" : "File deletion failed: " + result;
            
            FileDeleteResponse response = new FileDeleteResponse(success, message);
            response.setDeletedFromCloudinary(success);
            
            log.info("File deletion result for {}: {}", publicId, result);
            return response;
            
        } catch (Exception e) {
            log.error("Failed to delete file: {}", publicId, e);
            return new FileDeleteResponse(false, "Delete failed: " + e.getMessage());
        }
    }

    /**
     * Generate optimized URLs for different use cases
     */
    public String getOptimizedUrl(String publicId, String transformationString) {
        try {
            return cloudinary.url()
                .resourceType("image")
                .generate(publicId + ".jpg?transformation=" + transformationString);
        } catch (Exception e) {
            // Fallback to basic URL
            return cloudinary.url().generate(publicId);
        }
    }

    /**
     * Get thumbnail URL for images
     */
    public String getThumbnailUrl(String publicId) {
        try {
            return cloudinary.url()
                .resourceType("image")
                .generate(publicId + ".jpg?w=150&h=150&c=fill&f=auto&q=auto");
        } catch (Exception e) {
            return cloudinary.url().generate(publicId);
        }
    }

    /**
     * Get profile picture URL with standard sizing
     */
    public String getProfilePictureUrl(String publicId, String size) {
        String transformation = switch (size.toLowerCase()) {
            case "small" -> "w=50&h=50&c=fill&f=auto&q=auto";
            case "medium" -> "w=150&h=150&c=fill&f=auto&q=auto";
            case "large" -> "w=300&h=300&c=fill&f=auto&q=auto";
            default -> "w=150&h=150&c=fill&f=auto&q=auto";
        };
        
        try {
            return cloudinary.url()
                .resourceType("image")
                .generate(publicId + ".jpg?" + transformation);
        } catch (Exception e) {
            return cloudinary.url().generate(publicId);
        }
    }

    // Private helper methods
    
    private String validateFile(MultipartFile file, FileType fileType) {
        if (file.isEmpty()) {
            return "File is empty";
        }

        // Check file size
        if (file.getSize() > fileType.getMaxSize()) {
            return String.format("File size exceeds limit of %d MB", fileType.getMaxSize() / (1024 * 1024));
        }

        // Check file type
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            return "Invalid file format";
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        
        // Validate based on file type
        boolean isValidFormat = switch (fileType) {
            case PROFILE_PICTURE -> IMAGE_TYPES.contains(extension);
            case CV_RESUME, BIRTH_CERTIFICATE, ACADEMIC_TRANSCRIPT, MEDICAL_CERTIFICATE, 
                 ID_DOCUMENT, CERTIFICATE -> DOCUMENT_TYPES.contains(extension) || IMAGE_TYPES.contains(extension);
            case OTHER_DOCUMENT -> DOCUMENT_TYPES.contains(extension) || IMAGE_TYPES.contains(extension) || VIDEO_TYPES.contains(extension);
        };

        if (!isValidFormat) {
            return "Unsupported file format: " + extension;
        }

        return null; // No validation errors
    }

    private String determineResourceType(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null) return "raw";
        
        String extension = filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
        
        if (IMAGE_TYPES.contains(extension)) return "image";
        if (VIDEO_TYPES.contains(extension)) return "video";
        return "raw"; // For documents and other files
    }

    private String generatePublicId(String userId, FileType fileType) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        return String.format("%s_%s_%s", userId, fileType.getCode(), timestamp);
    }

    private FileInfo createFileInfo(Map<String, Object> uploadResult, String originalFilename, String description) {
        FileInfo fileInfo = new FileInfo();
        fileInfo.setUrl((String) uploadResult.get("url"));
        fileInfo.setSecureUrl((String) uploadResult.get("secure_url"));
        fileInfo.setPublicId((String) uploadResult.get("public_id"));
        fileInfo.setFormat((String) uploadResult.get("format"));
        fileInfo.setBytes(((Number) uploadResult.get("bytes")).longValue());
        
        // Handle optional width/height for images
        if (uploadResult.get("width") != null) {
            fileInfo.setWidth(((Number) uploadResult.get("width")).intValue());
        }
        if (uploadResult.get("height") != null) {
            fileInfo.setHeight(((Number) uploadResult.get("height")).intValue());
        }
        
        fileInfo.setResourceType((String) uploadResult.get("resource_type"));
        fileInfo.setOriginalFilename(originalFilename);
        fileInfo.setUploadedAt(LocalDateTime.now().toString());
        
        return fileInfo;
    }
}