package com.academix.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

public class FileUploadDTOs {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileUploadRequest {
        private String fileType; // "profile", "birth_certificate", "cv", etc.
        private String description;
        private boolean isPublic = false; // For privacy control
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileUploadResponse {
        private boolean success;
        private String message;
        private FileInfo fileInfo;
        
        public FileUploadResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileInfo {
        private String url;
        private String secureUrl;
        private String publicId;
        private String format;
        private long bytes;
        private int width;
        private int height;
        private String resourceType; // image, video, raw
        private String originalFilename;
        private String uploadedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileListResponse {
        private boolean success;
        private String message;
        private java.util.List<UserFileInfo> files;
        
        public FileListResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserFileInfo {
        private String fileType;
        private String url;
        private String description;
        private String uploadedAt;
        private String format;
        private long sizeBytes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileDeleteRequest {
        private String fileType;
        private String publicId; // Optional - if provided, will delete from Cloudinary too
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FileDeleteResponse {
        private boolean success;
        private String message;
        private boolean deletedFromCloudinary = false;
        
        public FileDeleteResponse(boolean success, String message) {
            this.success = success;
            this.message = message;
            this.deletedFromCloudinary = false;
        }
    }

    // Predefined file types for validation
    public enum FileType {
        PROFILE_PICTURE("profile_picture", "Profile Picture", 5 * 1024 * 1024), // 5MB
        BIRTH_CERTIFICATE("birth_certificate", "Birth Certificate", 10 * 1024 * 1024), // 10MB
        ACADEMIC_TRANSCRIPT("academic_transcript", "Academic Transcript", 10 * 1024 * 1024),
        MEDICAL_CERTIFICATE("medical_certificate", "Medical Certificate", 10 * 1024 * 1024),
        ID_DOCUMENT("id_document", "ID Document", 10 * 1024 * 1024),
        CV_RESUME("cv_resume", "CV/Resume", 15 * 1024 * 1024), // 15MB
        CERTIFICATE("certificate", "Certificate/Qualification", 10 * 1024 * 1024),
        OTHER_DOCUMENT("other_document", "Other Document", 20 * 1024 * 1024); // 20MB

        private final String code;
        private final String displayName;
        private final long maxSize;

        FileType(String code, String displayName, long maxSize) {
            this.code = code;
            this.displayName = displayName;
            this.maxSize = maxSize;
        }

        public String getCode() { return code; }
        public String getDisplayName() { return displayName; }
        public long getMaxSize() { return maxSize; }

        public static FileType fromCode(String code) {
            for (FileType type : values()) {
                if (type.code.equals(code)) {
                    return type;
                }
            }
            return OTHER_DOCUMENT;
        }
    }
}