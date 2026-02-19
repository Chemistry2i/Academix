package com.academix.server.controller;

import com.academix.server.dto.FileUploadDTOs.*;
import com.academix.server.service.FileUploadService;
import com.academix.server.service.UserService;
import com.academix.server.service.AuthService;
import com.academix.server.model.User;
import com.academix.server.model.Student;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.*;

/**
 * REST Controller for handling file uploads and management
 * Supports profile pictures, documents, certificates, etc.
 */
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FileUploadController {

    private final FileUploadService fileUploadService;
    private final UserService userService;
    private final AuthService authService;

    /**
     * Upload a file for the authenticated user
     */
    @PostMapping("/upload")
    public ResponseEntity<FileUploadResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("fileType") String fileType,
            @RequestParam(value = "description", required = false) String description,
            Principal principal) {
        
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new FileUploadResponse(false, "Authentication required"));
            }

            // Get user by email
            User user = authService.findUserByEmail(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new FileUploadResponse(false, "User not found"));
            }

            // Validate file type
            FileType type;
            try {
                type = FileType.fromCode(fileType);
            } catch (Exception e) {
                return ResponseEntity.badRequest()
                    .body(new FileUploadResponse(false, "Invalid file type: " + fileType));
            }

            // Upload file
            FileUploadResponse response = fileUploadService.uploadFile(file, user.getId().toString(), type, description);
            
            if (response.isSuccess()) {
                // Update user/student record with the new file URL
                boolean updated = updateUserFileUrl(user, type, response.getFileInfo().getSecureUrl());
                if (!updated) {
                    log.warn("Failed to update user record with file URL for user: {}, fileType: {}", user.getId(), fileType);
                }
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
            
        } catch (Exception e) {
            log.error("Error uploading file", e);
            return ResponseEntity.internalServerError()
                .body(new FileUploadResponse(false, "Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Delete a file for the authenticated user
     */
    @DeleteMapping("/delete")
    public ResponseEntity<FileDeleteResponse> deleteFile(
            @RequestParam("fileType") String fileType,
            @RequestParam(value = "publicId", required = false) String publicId,
            Principal principal) {
        
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new FileDeleteResponse(false, "Authentication required"));
            }

            User user = authService.findUserByEmail(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new FileDeleteResponse(false, "User not found"));
            }

            FileType type = FileType.fromCode(fileType);
            
            // Delete from Cloudinary if publicId provided
            FileDeleteResponse response = new FileDeleteResponse(true, "File reference removed");
            if (publicId != null && !publicId.trim().isEmpty()) {
                response = fileUploadService.deleteFile(publicId, "auto");
            }

            // Remove URL from user record
            boolean updated = updateUserFileUrl(user, type, null);
            if (updated) {
                response.setMessage(response.getMessage() + " and database updated");
            }

            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error deleting file", e);
            return ResponseEntity.internalServerError()
                .body(new FileDeleteResponse(false, "Delete failed: " + e.getMessage()));
        }
    }

    /**
     * Get file information for the authenticated user
     */
    @GetMapping("/my-files")
    public ResponseEntity<FileListResponse> getMyFiles(Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new FileListResponse(false, "Authentication required"));
            }

            User user = authService.findUserByEmail(principal.getName());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new FileListResponse(false, "User not found"));
            }

            List<UserFileInfo> files = collectUserFiles(user);
            FileListResponse response = new FileListResponse(true, "Files retrieved successfully");
            response.setFiles(files);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving user files", e);
            return ResponseEntity.internalServerError()
                .body(new FileListResponse(false, "Failed to retrieve files: " + e.getMessage()));
        }
    }

    /**
     * Get optimized URLs for images
     */
    @GetMapping("/optimized-url")
    public ResponseEntity<Map<String, String>> getOptimizedUrl(
            @RequestParam("publicId") String publicId,
            @RequestParam(value = "transformation", defaultValue = "w_300,h_300,c_fill,f_auto,q_auto") String transformation) {
        
        try {
            String optimizedUrl = fileUploadService.getOptimizedUrl(publicId, transformation);
            Map<String, String> response = Map.of(
                "success", "true",
                "optimizedUrl", optimizedUrl,
                "transformation", transformation
            );
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error generating optimized URL", e);
            Map<String, String> errorResponse = Map.of(
                "success", "false",
                "message", "Failed to generate optimized URL: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get profile picture URL with different sizes
     */
    @GetMapping("/profile-picture/{userId}")
    public ResponseEntity<Map<String, String>> getProfilePictureUrls(@PathVariable String userId) {
        try {
            // This would typically get the user's profile picture public ID from database
            // For now, return a placeholder implementation
            Map<String, String> response = Map.of(
                "success", "true",
                "message", "Use the optimized-url endpoint with the user's profile picture public ID"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error retrieving profile picture URLs", e);
            Map<String, String> errorResponse = Map.of(
                "success", "false", 
                "message", "Failed to retrieve profile picture URLs: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Helper methods
    
    private boolean updateUserFileUrl(User user, FileType fileType, String url) {
        try {
            switch (fileType) {
                case PROFILE_PICTURE -> user.setProfilePictureUrl(url);
                case BIRTH_CERTIFICATE -> user.setBirthCertificateUrl(url);
                case ID_DOCUMENT -> user.setIdDocumentUrl(url);
                case CV_RESUME -> user.setCvResumeUrl(url);
                case CERTIFICATE -> {
                    // Handle multiple certificates as JSON array
                    if (url == null) {
                        user.setCertificateUrls(null);
                    } else {
                        // For simplicity, just store the latest certificate URL
                        user.setCertificateUrls(url);
                    }
                }
                case ACADEMIC_TRANSCRIPT -> {
                    if (user instanceof Student student) {
                        student.setAcademicTranscriptUrl(url);
                    }
                }
                case MEDICAL_CERTIFICATE -> {
                    if (user instanceof Student student) {
                        student.setMedicalCertificateUrl(url);
                    }
                }
                case OTHER_DOCUMENT -> {
                    if (user instanceof Student student) {
                        student.setOtherDocumentUrls(url);
                    }
                }
                default -> {
                    log.warn("Unhandled file type for URL update: {}", fileType);
                    return false;
                }
            }
            
            userService.save(user);
            return true;
            
        } catch (Exception e) {
            log.error("Failed to update user file URL", e);
            return false;
        }
    }

    private List<UserFileInfo> collectUserFiles(User user) {
        List<UserFileInfo> files = new ArrayList<>();
        
        if (user.getProfilePictureUrl() != null) {
            files.add(new UserFileInfo("profile_picture", user.getProfilePictureUrl(), "Profile Picture", user.getUpdatedAt().toString(), "image", 0));
        }
        if (user.getBirthCertificateUrl() != null) {
            files.add(new UserFileInfo("birth_certificate", user.getBirthCertificateUrl(), "Birth Certificate", user.getUpdatedAt().toString(), "document", 0));
        }
        if (user.getIdDocumentUrl() != null) {
            files.add(new UserFileInfo("id_document", user.getIdDocumentUrl(), "ID Document", user.getUpdatedAt().toString(), "document", 0));
        }
        if (user.getCvResumeUrl() != null) {
            files.add(new UserFileInfo("cv_resume", user.getCvResumeUrl(), "CV/Resume", user.getUpdatedAt().toString(), "document", 0));
        }
        if (user.getCertificateUrls() != null) {
            files.add(new UserFileInfo("certificate", user.getCertificateUrls(), "Certificates", user.getUpdatedAt().toString(), "document", 0));
        }
        
        // Add student-specific files
        if (user instanceof Student student) {
            if (student.getAcademicTranscriptUrl() != null) {
                files.add(new UserFileInfo("academic_transcript", student.getAcademicTranscriptUrl(), "Academic Transcript", user.getUpdatedAt().toString(), "document", 0));
            }
            if (student.getMedicalCertificateUrl() != null) {
                files.add(new UserFileInfo("medical_certificate", student.getMedicalCertificateUrl(), "Medical Certificate", user.getUpdatedAt().toString(), "document", 0));
            }
            if (student.getOtherDocumentUrls() != null) {
                files.add(new UserFileInfo("other_document", student.getOtherDocumentUrls(), "Other Documents", user.getUpdatedAt().toString(), "document", 0));
            }
        }
        
        return files;
    }
}