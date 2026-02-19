package com.academix.server.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Cloudinary Configuration for file uploads
 * 
 * Set these environment variables:
 * CLOUDINARY_CLOUD_NAME=your_cloud_name
 * CLOUDINARY_API_KEY=your_api_key  
 * CLOUDINARY_API_SECRET=your_api_secret
 */
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:demo}")
    private String cloudName;

    @Value("${cloudinary.api-key:demo}")
    private String apiKey;

    @Value("${cloudinary.api-secret:demo}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }
}