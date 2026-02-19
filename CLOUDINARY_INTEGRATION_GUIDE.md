# 🌤️ Cloudinary File Upload Integration Guide

## Overview
This guide covers the complete Cloudinary integration for Academix, enabling secure file uploads for profile pictures, documents, certificates, and other files with automatic optimization and URL storage in the database.

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Client  │────│  Spring Boot API │────│   Cloudinary    │
│   File Upload   │    │  File Controller │    │  Cloud Storage  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         │                        │                       │
         v                        v                       v
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   FileUpload    │    │   UserService     │    │  Optimized URLs │
│   Component     │    │   Database URL    │    │  Transformations│
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 📋 Features

### ✅ **Supported File Types**
- **Images**: JPG, JPEG, PNG, GIF, WebP, BMP
- **Documents**: PDF, DOC, DOCX, TXT, RTF  
- **Videos**: MP4, AVI, MOV, WMV (for special documents)

### 🎯 **File Categories by User Type**

#### **Students:**
- Profile Picture (required)
- Birth Certificate (required)
- Academic Transcripts
- Medical Certificates
- ID Documents
- Other Documents

#### **Staff/Teachers:**
- Profile Picture (required)
- CV/Resume
- Certificates/Qualifications
- ID Documents

#### **Admins:**
- Profile Picture
- Official Documents

### 🔒 **Security Features**
- File size validation (5-20MB depending on type)
- File type validation
- Secure signed uploads
- Access control through authentication
- Cloudinary secure URLs

## 🚀 Setup Instructions

### 1. **Cloudinary Account Setup**
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your credentials from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. **Environment Variables**
Add to your environment or `.env` file:
```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. **Application Properties**
Already configured in `application.properties`:
```properties
# Cloudinary Configuration
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME:demo}
cloudinary.api-key=${CLOUDINARY_API_KEY:demo}  
cloudinary.api-secret=${CLOUDINARY_API_SECRET:demo}

# File Upload Limits
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=25MB
```

### 4. **Database Schema Updates**
The User and Student models have been updated with new file URL fields:

#### **User Model (Base):**
```sql
profile_picture_url VARCHAR(500)
birth_certificate_url VARCHAR(500)
id_document_url VARCHAR(500)
cv_resume_url VARCHAR(500)
certificate_urls VARCHAR(1000) -- JSON array for multiple certificates
```

#### **Student Model (Additional):**
```sql
academic_transcript_url VARCHAR(500)
medical_certificate_url VARCHAR(500)
other_document_urls VARCHAR(1000) -- JSON array for additional documents
```

## 📡 API Endpoints

### **Upload File**
```http
POST /api/files/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Parameters:
- file: MultipartFile (required)
- fileType: String (required) - profile_picture, birth_certificate, etc.
- description: String (optional)
```

### **Delete File**  
```http
DELETE /api/files/delete
Authorization: Bearer {token}

Parameters:
- fileType: String (required)
- publicId: String (optional) - for Cloudinary deletion
```

### **Get User Files**
```http
GET /api/files/my-files
Authorization: Bearer {token}
```

### **Get Optimized URL**
```http
GET /api/files/optimized-url
Parameters:
- publicId: String (required)
- transformation: String (optional, default: "w_300,h_300,c_fill,f_auto,q_auto")
```

## 💻 Frontend Usage

### **Basic File Upload**
```jsx
import { FileUpload } from '../components/common';

function ProfilePage() {
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result.fileInfo.secureUrl);
  };

  return (
    <FileUpload
      fileType="profile_picture"
      label="Profile Picture"
      description="Upload a clear photo of yourself"
      maxSize={5}
      onUploadSuccess={handleUploadSuccess}
      onUploadError={console.error}
    />
  );
}
```

### **Complete Registration Form**
```jsx
import { FileUploadDemo } from '../components/common';

function StudentRegistration() {
  return (
    <div>
      <h1>Student Registration</h1>
      <FileUploadDemo userType="student" />
    </div>
  );
}
```

## 🎨 Cloudinary Features

### **Automatic Optimizations**
- **Format:** Auto-select best format (WebP, AVIF, etc.)
- **Quality:** Intelligent quality adjustment
- **Compression:** Automatic optimization

### **Transformations**
- **Profile Pictures:** `w_150,h_150,c_fill,f_auto,q_auto`
- **Thumbnails:** `w_50,h_50,c_fill,f_auto,q_auto`
- **Large Display:** `w_800,h_600,c_fit,f_auto,q_auto`

### **Folder Structure**
Files are organized in Cloudinary:
```
academix/
  users/
    {userId}/
      profile_picture/
      birth_certificate/
      cv_resume/
      academic_transcript/
      ...
```

## ⚡ Performance Benefits

1. **CDN Delivery:** Global content delivery network
2. **Lazy Loading:** On-demand image loading
3. **Responsive Images:** Multiple sizes for different devices
4. **Bandwidth Optimization:** Reduced file sizes
5. **Caching:** Automatic browser and CDN caching

## 🛠️ Customization Examples

### **Custom Transformation**
```javascript
const profileUrl = fileUploadService.getProfilePictureUrl(publicId, "medium");
// Returns: https://res.cloudinary.com/.../w_150,h_150,c_fill,f_auto,q_auto/...
```

### **Custom File Validation**
```jsx
<FileUpload
  fileType="custom_document"
  accept=".pdf,.jpg,.png"
  maxSize={10}
  onBeforeUpload={(file) => {
    // Custom validation logic
    return file.size > 0;
  }}
/>
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **Upload Fails with 413 Error**
   - **Solution:** Increase `spring.servlet.multipart.max-file-size`

2. **Cloudinary Credentials Error**
   - **Solution:** Verify environment variables are set correctly

3. **File Type Rejected**
   - **Solution:** Check file extension matches allowed types

4. **Image Not Displaying**
   - **Solution:** Verify secure URL is saved in database

### **Debug Endpoints:**
- `GET /api/files/my-files` - Check uploaded files
- Check browser Network tab for upload requests
- Verify Cloudinary dashboard for uploaded files

## 📊 File Size Recommendations

| File Type | Max Size | Recommended | Format |
|-----------|----------|-------------|--------|
| Profile Picture | 5MB | 500KB | JPG/PNG |
| Documents | 10MB | 2-3MB | PDF |
| Certificates | 10MB | 1-2MB | PDF/JPG |
| CV/Resume | 15MB | 2-5MB | PDF |
| Videos | 20MB | 5-10MB | MP4 |

## 🌟 Best Practices

1. **Image Optimization:**
   - Use JPG for photos, PNG for graphics
   - Compress before upload when possible
   - Use appropriate resolution (300 DPI for documents)

2. **Security:**
   - Authenticate all upload requests
   - Validate file types on both client and server
   - Use signed URLs for sensitive documents

3. **User Experience:**
   - Provide upload progress feedback
   - Show clear error messages
   - Allow file preview before upload

4. **Performance:**
   - Use Cloudinary transformations for different contexts
   - Implement lazy loading for image galleries
   - Cache optimized URLs when possible

## 📈 Monitoring & Analytics

Monitor your Cloudinary usage:
- **Dashboard:** cloudinary.com/console
- **Usage Stats:** Storage, bandwidth, transformations
- **Performance:** Delivery speed, optimization gains

## 🎯 Next Steps

1. Set up your Cloudinary account
2. Configure environment variables  
3. Test file uploads with the demo component
4. Integrate into your registration/profile forms
5. Customize transformations for your needs
6. Monitor usage and optimize as needed

---

**💡 Pro Tip:** Start with the demo component to understand the flow, then customize the FileUpload component for your specific needs!