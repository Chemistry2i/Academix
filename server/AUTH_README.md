# Academix Authentication System

## Overview

The Academix authentication system has been enhanced to be production-ready with the following features:

- JWT-based authentication with access and refresh tokens
- Secure password hashing using BCrypt
- Email verification for new accounts
- Forgot password and reset functionality
- Token resend capabilities
- Comprehensive security configuration

## Features

### 🔐 Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register a new user account |
| `/api/auth/login` | POST | Authenticate and get JWT tokens |
| `/api/auth/verify-email` | POST | Verify email using verification token |
| `/api/auth/forgot-password` | POST | Request password reset email |
| `/api/auth/reset-password` | POST | Reset password using reset token |
| `/api/auth/change-password` | PUT | Change password for authenticated user |
| `/api/auth/resend-token` | POST | Resend verification or reset token |
| `/api/auth/refresh-token` | POST | Refresh access token |
| `/api/auth/logout` | POST | Logout (TODO: implement token blacklisting) |
| `/api/auth/users` | GET | Get all users (testing only) |

### 🔒 Security Features

- **JWT Tokens**: Secure access and refresh tokens with configurable expiration
- **Password Hashing**: BCrypt with strength 12 for optimal security
- **Email Verification**: Required before account activation
- **Token Expiration**: 
  - Access tokens: 24 hours (configurable)
  - Refresh tokens: 7 days (configurable)
  - Reset tokens: 15 minutes
  - Verification tokens: 24 hours
- **CORS Configuration**: Configurable for different environments
- **Input Validation**: Comprehensive validation using Jakarta Bean Validation

## Setup Instructions

### 1. Dependencies Added

The following JWT dependencies have been added to `pom.xml`:

```xml
<!-- JWT Dependencies -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
```

### 2. Configuration

Update `application.properties` with the following configurations:

```properties
# JWT Configuration
jwt.secret=your-secret-key-at-least-256-bits
jwt.expiration=86400000
jwt.refresh.expiration=604800000

# Email Configuration
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${EMAIL_USERNAME}
spring.mail.password=${EMAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Application Configuration
app.frontend.url=${FRONTEND_URL:http://localhost:5173}
```

### 3. Environment Variables

Set the following environment variables for production:

```bash
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
DATABASE_URL=your-production-database-url
```

## API Usage Examples

### Registration

```javascript
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123",
  "role": "STUDENT",
  "gender": "MALE",
  "phoneNumber": "+256700000000",
  "district": "Kampala"
}
```

### Login

```javascript
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePassword123"
}

// Response
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400000,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "role": "STUDENT",
    "emailVerified": true,
    "isActive": true
  }
}
```

### Forgot Password

```javascript
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "john.doe@example.com"
}
```

### Reset Password

```javascript
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "password-reset-token-from-email",
  "newPassword": "NewSecurePassword123"
}
```

## Testing

### 1. Using the Test Page

A comprehensive test page is available at:
```
http://https://organic-winner-pqprvg9gx94f69j7-8080.app.github.dev/auth-test.html
```

This page allows you to test all authentication endpoints interactively.

### 2. Using cURL

```bash
# Register
curl -X POST http://https://organic-winner-pqprvg9gx94f69j7-8080.app.github.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "password": "SecurePassword123",
    "role": "STUDENT",
    "gender": "MALE"
  }'

# Login
curl -X POST http://https://organic-winner-pqprvg9gx94f69j7-8080.app.github.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePassword123"
  }'
```

## Database Schema

The User model has been enhanced with the following fields for authentication:

```java
// Password reset fields
private String resetPasswordToken;
private LocalDateTime resetPasswordExpiry;

// Email verification fields  
private String emailVerificationToken;
private LocalDateTime emailVerificationExpiry;
private Boolean emailVerified = false;
```

## Services Architecture

### 1. AuthService
Central authentication logic handling registration, login, password operations.

### 2. JwtService
JWT token generation, validation, and management.

### 3. EmailService
Email sending for verification, password reset, and welcome messages.

### 4. UserService
Enhanced with token management and password operations.

## Security Best Practices

1. **Secure Headers**: CORS and security headers configured
2. **Password Strength**: Minimum 8 characters required
3. **Token Expiration**: Short-lived access tokens with refresh mechanism
4. **Email Verification**: Required before account activation
5. **Rate Limiting**: TODO - implement rate limiting for authentication endpoints
6. **Input Validation**: Comprehensive validation on all inputs
7. **Error Handling**: Secure error messages that don't leak information

## Production Considerations

### 1. Database Migration
- Replace in-memory storage with proper database repositories
- Implement proper user entity relationships

### 2. Token Management
- Implement token blacklisting for secure logout
- Add token rotation for refresh tokens
- Consider Redis for token storage

### 3. Email Service
- Use professional email service (SendGrid, AWS SES, etc.)
- Implement email templates
- Add email rate limiting

### 4. Monitoring
- Add authentication metrics and logging
- Implement security alerts
- Monitor failed login attempts

### 5. Additional Features
- Multi-factor authentication (MFA)
- Social authentication (Google, Facebook)
- Account lockout after failed attempts
- Password complexity requirements

## Frontend Integration

The authentication system is designed to work seamlessly with the React frontend:

1. Store JWT tokens in secure storage (httpOnly cookies recommended)
2. Include Authorization header: `Bearer <access-token>`
3. Implement token refresh logic
4. Handle authentication states in React context
5. Protect routes based on authentication and authorization

## Support

For any issues or questions regarding the authentication system, please check:

1. Application logs for detailed error information
2. Database console at `/h2-console` (development only)
3. Test page at `/auth-test.html` for endpoint verification

---

**Note**: This implementation uses in-memory storage for testing. In production, replace with proper database repositories and implement additional security measures as outlined in the production considerations section.