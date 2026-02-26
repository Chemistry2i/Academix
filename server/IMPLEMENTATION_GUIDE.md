# Academix Server Implementation Guide

> **School Management System Backend for Ugandan Secondary Schools**  
> Built with Spring Boot 4.0.2 | JWT Authentication | JPA/Hibernate

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Ugandan Education System Support](#ugandan-education-system-support)
7. [Entity Relationships](#entity-relationships)
8. [Services Documentation](#services-documentation)
9. [Authentication & Authorization](#authentication--authorization)
10. [Getting Started](#getting-started)

---

## Overview

Academix is a comprehensive School Management System designed specifically for Ugandan secondary schools. The system supports:

- **O-Level (S1-S4)**: Senior 1 to Senior 4 leading to UCE (Uganda Certificate of Education)
- **A-Level (S5-S6)**: Senior 5 to Senior 6 leading to UACE (Uganda Advanced Certificate of Education)
- **Ugandan Grading Systems**: D1-F9 for O-Level, A-F for A-Level
- **Subject Combinations**: Principal and subsidiary subjects for A-Level

---

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Spring Boot | 4.0.2 | Main framework |
| Spring Security | 6.x | Authentication & Authorization |
| Spring Data JPA | 3.x | Database ORM |
| JWT (jjwt) | 0.11.5 | Token-based authentication |
| H2 Database | - | Development database |
| MySQL | - | Production database |
| Lombok | - | Boilerplate reduction |
| Jakarta Validation | - | Bean validation |

---

## Project Structure

```
server/src/main/java/com/academix/server/
├── config/
│   └── SecurityConfig.java          # Spring Security configuration
├── controller/
│   ├── AttendanceController.java    # Attendance management
│   ├── AuthController.java          # Authentication endpoints
│   ├── CourseController.java        # A-Level course management
│   ├── EnrollmentController.java    # Student/Teacher enrollments
│   ├── ExamController.java          # Exam management
│   ├── GradeController.java         # Grading reference
│   ├── ResultController.java        # Student results
│   ├── SchoolClassController.java   # Class management
│   ├── StudentController.java       # Student CRUD
│   ├── SubjectController.java       # Subject management
│   ├── TeacherController.java       # Teacher CRUD
│   ├── TimetableController.java     # Schedule management
│   └── UserController.java          # User management
├── dto/
│   └── AuthDto.java                 # Authentication DTOs
├── model/
│   ├── Attendance.java              # Attendance records
│   ├── Course.java                  # A-Level combinations
│   ├── Exam.java                    # Examination entity
│   ├── Result.java                  # Student results
│   ├── SchoolClass.java             # Class/Form entity
│   ├── Student.java                 # Student entity (extends User)
│   ├── StudentCourse.java           # Student-Course join table
│   ├── StudentSubject.java          # Student-Subject join table
│   ├── Subject.java                 # Subject entity
│   ├── Teacher.java                 # Teacher entity (extends User)
│   ├── TeacherSubject.java          # Teacher-Subject join table
│   ├── Timetable.java               # Timetable entity
│   └── User.java                    # Base user entity
├── repository/
│   ├── AttendanceRepository.java
│   ├── CourseRepository.java
│   ├── ExamRepository.java
│   ├── ResultRepository.java
│   ├── SchoolClassRepository.java
│   ├── StudentCourseRepository.java
│   ├── StudentRepository.java
│   ├── StudentSubjectRepository.java
│   ├── SubjectRepository.java
│   ├── TeacherRepository.java
│   ├── TeacherSubjectRepository.java
│   ├── TimetableRepository.java
│   └── UserRepository.java
└── service/
    ├── AttendanceService.java
    ├── CourseService.java
    ├── EnrollmentService.java
    ├── ExamService.java
    ├── ResultService.java
    ├── SchoolClassService.java
    ├── StudentService.java
    ├── SubjectService.java
    ├── TeacherService.java
    └── TimetableService.java
```

---

## Database Models

### Core Entities

#### User (Base Entity)
```java
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
public class User {
    Long id;
    String email;
    String password;
    String firstName;
    String lastName;
    Role role;  // ADMIN, TEACHER, STUDENT, PARENT, HEAD_TEACHER
    Boolean isActive;
    Boolean isEmailVerified;
}
```

#### Student (extends User)
```java
@Entity
public class Student extends User {
    String studentId;           // e.g., "STU2024001"
    String admissionNumber;
    LocalDate dateOfBirth;
    String gender;
    String nationality;
    String nin;                 // National ID Number
    String currentClass;        // e.g., "S3A"
    Integer formLevel;          // 1-6
    LevelType levelType;        // O_LEVEL, A_LEVEL
    String combination;         // A-Level: "PCM", "HEG"
    LocalDate enrollmentDate;
    StudentStatus status;       // ACTIVE, SUSPENDED, GRADUATED, etc.
    
    // Relationships
    List<StudentSubject> enrolledSubjects;
    List<StudentCourse> courseEnrollments;
    List<Result> results;
    List<Attendance> attendanceRecords;
    SchoolClass schoolClass;
}
```

#### Teacher (extends User)
```java
@Entity
public class Teacher extends User {
    String teacherId;           // e.g., "TCH2024001"
    String employeeNumber;
    String qualification;
    String specialization;
    String nin;
    LocalDate dateOfBirth;
    String gender;
    String nationality;
    LocalDate hireDate;
    TeacherStatus status;
    Boolean isClassTeacher;
    String classResponsibility;
    String department;
    
    // Relationships
    List<TeacherSubject> subjectAssignments;
    List<SchoolClass> classesAsTeacher;
}
```

### Academic Entities

#### Subject
```java
@Entity
public class Subject {
    Long id;
    String code;                // e.g., "PHY", "MTH"
    String name;
    String description;
    SubjectCategory category;   // SCIENCES, ARTS, LANGUAGES, etc.
    LevelType levelType;        // O_LEVEL, A_LEVEL, BOTH
    Boolean isPrincipal;        // A-Level principal subject
    Boolean isSubsidiary;       // A-Level subsidiary
    Boolean isCore;             // Compulsory subject
    Integer creditUnits;
    Boolean isActive;
    
    // Relationships
    List<StudentSubject> enrolledStudents;
    List<TeacherSubject> assignedTeachers;
}
```

#### Course (A-Level Combinations)
```java
@Entity
public class Course {
    Long id;
    String code;                // e.g., "PCM", "HEG"
    String name;                // "Physics, Chemistry, Mathematics"
    String description;
    CourseCategory category;    // SCIENCES, ARTS, BUSINESS
    
    // Subject relationships
    Subject principal1;
    Subject principal2;
    Subject principal3;
    Subject subsidiary1;
    Boolean isActive;
    
    // Relationships
    List<StudentCourse> enrolledStudents;
    List<SchoolClass> classes;
}
```

#### Exam
```java
@Entity
public class Exam {
    Long id;
    String code;
    String name;
    ExamType examType;          // MID_TERM, END_OF_TERM, MOCK, UCE, UACE
    String term;                // "Term 1", "Term 2", "Term 3"
    String academicYear;        // "2024"
    Integer formLevel;
    Subject subject;
    LocalDate examDate;
    LocalTime startTime;
    LocalTime endTime;
    Integer duration;           // In minutes
    Double totalMarks;
    Double passMark;
    ExamStatus status;          // SCHEDULED, IN_PROGRESS, COMPLETED, etc.
    Boolean isLocked;
    Boolean isPublished;
}
```

#### Result
```java
@Entity
public class Result {
    Long id;
    Student student;
    Exam exam;
    Subject subject;
    Double marksObtained;
    String grade;               // O-Level: D1-F9, A-Level: A-F
    Integer points;             // Grade points
    String remarks;
    String term;
    String academicYear;
    Integer formLevel;
    LevelType levelType;
    ResultStatus status;
}
```

### Join Entities

#### StudentSubject (Student ↔ Subject)
```java
@Entity
public class StudentSubject {
    Long id;
    Student student;
    Subject subject;
    Boolean isPrincipal;        // A-Level principal
    Boolean isSubsidiary;       // A-Level subsidiary
    String academicYear;
    LocalDate enrollmentDate;
    Boolean isActive;
}
```

#### TeacherSubject (Teacher ↔ Subject)
```java
@Entity
public class TeacherSubject {
    Long id;
    Teacher teacher;
    Subject subject;
    Boolean isPrimary;          // Primary subject assignment
    String assignedClasses;     // "S1A,S2B,S3A"
    String academicYear;
    LocalDate assignmentDate;
    Boolean isActive;
}
```

#### StudentCourse (Student ↔ Course)
```java
@Entity
public class StudentCourse {
    Long id;
    Student student;
    Course course;
    String academicYear;
    LocalDate enrollmentDate;
    Boolean isActive;
}
```

#### SchoolClass
```java
@Entity
public class SchoolClass {
    Long id;
    String name;                // "S3A", "S5-PCM"
    Integer formLevel;          // 1-6
    String stream;              // "A", "B", "C"
    LevelType levelType;        // O_LEVEL, A_LEVEL
    Teacher classTeacher;
    Course course;              // For A-Level classes
    Integer maxCapacity;
    Integer currentCount;
    String classroom;
    String building;
    String academicYear;
    Boolean isActive;
}
```

### Support Entities

#### Attendance
```java
@Entity
public class Attendance {
    Long id;
    Student student;
    Subject subject;
    SchoolClass schoolClass;
    LocalDate date;
    AttendanceStatus status;    // PRESENT, ABSENT, LATE, EXCUSED
    String remarks;
    LocalTime checkInTime;
    Teacher markedBy;
}
```

#### Timetable
```java
@Entity
public class Timetable {
    Long id;
    String className;
    Integer formLevel;
    Subject subject;
    Teacher teacher;
    DayOfWeek dayOfWeek;
    LocalTime startTime;
    LocalTime endTime;
    String room;
    String building;
    String academicYear;
    String term;
    Boolean isActive;
}
```

---

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | User login |
| POST | `/logout` | User logout |
| POST | `/forgot-password` | Request password reset |
| POST | `/reset-password` | Reset password |
| GET | `/verify-email` | Verify email address |
| POST | `/refresh-token` | Refresh JWT token |

### Students (`/api/students`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create student |
| GET | `/` | Get all students |
| GET | `/{id}` | Get student by ID |
| GET | `/student-id/{studentId}` | Get by student ID |
| GET | `/class/{className}` | Get students by class |
| GET | `/form/{formLevel}` | Get students by form |
| GET | `/o-level` | Get O-Level students |
| GET | `/a-level` | Get A-Level students |
| PUT | `/{id}` | Update student |
| DELETE | `/{id}` | Delete student |
| PUT | `/{id}/promote` | Promote student |
| GET | `/search?q=` | Search students |
| GET | `/statistics` | Get student statistics |

### Teachers (`/api/teachers`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create teacher |
| GET | `/` | Get all teachers |
| GET | `/{id}` | Get teacher by ID |
| GET | `/teacher-id/{teacherId}` | Get by teacher ID |
| GET | `/department/{dept}` | Get by department |
| GET | `/subject/{subjectId}` | Get teachers by subject |
| PUT | `/{id}` | Update teacher |
| DELETE | `/{id}` | Delete teacher |
| GET | `/search?q=` | Search teachers |
| GET | `/statistics` | Get teacher statistics |

### Subjects (`/api/subjects`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create subject |
| GET | `/` | Get all subjects |
| GET | `/{id}` | Get subject by ID |
| GET | `/code/{code}` | Get by subject code |
| GET | `/category/{category}` | Get by category |
| GET | `/o-level` | Get O-Level subjects |
| GET | `/a-level` | Get A-Level subjects |
| GET | `/core` | Get core subjects |
| PUT | `/{id}` | Update subject |
| DELETE | `/{id}` | Delete subject |
| POST | `/initialize` | Initialize default subjects |

### Courses (`/api/courses`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create course |
| GET | `/` | Get all courses |
| GET | `/{id}` | Get course by ID |
| GET | `/code/{code}` | Get by course code |
| GET | `/category/{category}` | Get by category |
| PUT | `/{id}` | Update course |
| DELETE | `/{id}` | Delete course |
| POST | `/initialize` | Initialize default courses |

### Enrollments (`/api/enrollments`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/student/{id}/subject/{id}` | Enroll student in subject |
| DELETE | `/student/{id}/subject/{id}` | Drop student from subject |
| GET | `/student/{id}/subjects` | Get student's subjects |
| POST | `/student/{id}/course/{id}` | Enroll in A-Level course |
| POST | `/teacher/{id}/subject/{id}` | Assign teacher to subject |
| DELETE | `/teacher/{id}/subject/{id}` | Remove teacher from subject |
| GET | `/teacher/{id}/subjects` | Get teacher's subjects |
| GET | `/subject/{id}/students` | Get students in subject |
| GET | `/subject/{id}/teachers` | Get teachers for subject |
| GET | `/statistics` | Get enrollment statistics |

### Classes (`/api/classes`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create class |
| GET | `/` | Get all classes |
| GET | `/{id}` | Get class by ID |
| GET | `/name/{name}` | Get by class name |
| GET | `/year/{academicYear}` | Get by academic year |
| GET | `/o-level?academicYear=` | Get O-Level classes |
| GET | `/a-level?academicYear=` | Get A-Level classes |
| GET | `/form/{formLevel}?academicYear=` | Get by form level |
| PUT | `/{id}` | Update class |
| DELETE | `/{id}` | Delete class |
| POST | `/{classId}/teacher/{teacherId}` | Assign class teacher |
| POST | `/{classId}/course/{courseId}` | Assign course to class |
| GET | `/search?q=` | Search classes |
| GET | `/enrollment-summary?academicYear=` | Get enrollment summary |
| POST | `/initialize?academicYear=` | Initialize default classes |
| GET | `/statistics` | Get class statistics |

### Exams (`/api/exams`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create exam |
| GET | `/` | Get all exams |
| GET | `/{id}` | Get exam by ID |
| GET | `/subject/{subjectId}` | Get exams by subject |
| GET | `/form/{formLevel}` | Get exams by form |
| GET | `/type/{examType}` | Get by exam type |
| GET | `/upcoming` | Get upcoming exams |
| PUT | `/{id}` | Update exam |
| DELETE | `/{id}` | Delete exam |
| PUT | `/{id}/lock` | Lock exam results |
| PUT | `/{id}/unlock` | Unlock exam |
| PUT | `/{id}/publish` | Publish results |
| GET | `/{id}/analytics` | Get exam analytics |
| GET | `/schedule?startDate=&endDate=` | Get exam schedule |
| GET | `/statistics` | Get exam statistics |

### Results (`/api/results`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Record result |
| POST | `/bulk` | Record bulk results |
| GET | `/` | Get all results |
| GET | `/{id}` | Get result by ID |
| GET | `/student/{studentId}` | Get student results |
| GET | `/exam/{examId}` | Get exam results |
| GET | `/student/{id}/term/{term}/year/{year}` | Get term results |
| GET | `/student/{id}/report-card?term=&academicYear=` | Generate report card |
| PUT | `/{id}` | Update result |
| DELETE | `/{id}` | Delete result |
| GET | `/class/{className}/rankings?term=&academicYear=` | Get class rankings |
| GET | `/statistics` | Get result statistics |

### Grades (`/api/grades`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/o-level` | Get O-Level grading scale |
| GET | `/a-level` | Get A-Level grading scale |
| POST | `/calculate` | Calculate grade from marks |
| GET | `/aggregate/{points}` | Get aggregate interpretation |

### Attendance (`/api/attendance`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/mark` | Mark attendance |
| POST | `/bulk` | Mark bulk attendance |
| GET | `/` | Get all attendance records |
| GET | `/student/{studentId}` | Get student attendance |
| GET | `/class/{className}/date/{date}` | Get class attendance |
| GET | `/subject/{subjectId}/date/{date}` | Get subject attendance |
| PUT | `/{id}` | Update attendance |
| DELETE | `/{id}` | Delete attendance |
| GET | `/student/{id}/summary?startDate=&endDate=` | Get attendance summary |
| GET | `/class/{className}/report?startDate=&endDate=` | Get class report |
| GET | `/statistics` | Get attendance statistics |

### Timetable (`/api/timetables`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/` | Create timetable entry |
| POST | `/bulk` | Create bulk entries |
| GET | `/` | Get all timetables |
| GET | `/{id}` | Get entry by ID |
| GET | `/class/{className}` | Get class timetable |
| GET | `/teacher/{teacherId}` | Get teacher timetable |
| GET | `/class/{className}/day/{day}` | Get daily schedule |
| PUT | `/{id}` | Update entry |
| DELETE | `/{id}` | Delete entry |
| GET | `/conflicts?className=&academicYear=` | Check conflicts |
| DELETE | `/class/{className}` | Clear class timetable |
| GET | `/statistics` | Get timetable statistics |

---

## Ugandan Education System Support

### O-Level Grading (UCE)

| Grade | Marks Range | Points | Description |
|-------|-------------|--------|-------------|
| D1 | 80-100 | 1 | Distinction 1 |
| D2 | 75-79 | 2 | Distinction 2 |
| C3 | 70-74 | 3 | Credit 3 |
| C4 | 65-69 | 4 | Credit 4 |
| C5 | 60-64 | 5 | Credit 5 |
| C6 | 55-59 | 6 | Credit 6 |
| P7 | 45-54 | 7 | Pass 7 |
| P8 | 35-44 | 8 | Pass 8 |
| F9 | 0-34 | 9 | Fail |

### A-Level Grading (UACE)

| Grade | Marks Range | Points | Description |
|-------|-------------|--------|-------------|
| A | 80-100 | 6 | Excellent |
| B | 70-79 | 5 | Very Good |
| C | 60-69 | 4 | Good |
| D | 50-59 | 3 | Credit |
| E | 40-49 | 2 | Pass |
| O | 35-39 | 1 | Subsidiary Pass |
| F | 0-34 | 0 | Fail |

### Subject Categories

- **SCIENCES**: Physics, Chemistry, Biology, Mathematics
- **ARTS**: History, Geography, CRE, IRE, Literature
- **LANGUAGES**: English, Kiswahili, French, German, Arabic
- **TECHNICAL**: Agriculture, Computer Science, Technical Drawing
- **BUSINESS**: Commerce, Economics, Entrepreneurship, Accounting

### Default A-Level Combinations

| Code | Name | Subjects |
|------|------|----------|
| PCM | Physics, Chemistry, Mathematics | Physics, Chemistry, Math, GP |
| PCB | Physics, Chemistry, Biology | Physics, Chemistry, Biology, GP |
| BCM | Biology, Chemistry, Mathematics | Biology, Chemistry, Math, GP |
| MEG | Mathematics, Economics, Geography | Math, Economics, Geography, GP |
| HEG | History, Economics, Geography | History, Economics, Geography, GP |
| HED | History, Economics, Divinity | History, Economics, CRE, GP |
| HEL | History, Economics, Literature | History, Economics, Literature, GP |
| LEG | Literature, Economics, Geography | Literature, Economics, Geography, GP |

---

## Entity Relationships

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────┐
│   Student   │──────▶│  StudentSubject  │◀──────│   Subject   │
│  (extends   │ 1:N   │   (Join Table)   │ N:1   │             │
│    User)    │       └──────────────────┘       └─────────────┘
└─────────────┘                                        ▲
      │                                                │
      │ 1:N   ┌──────────────────┐                    │ N:1
      └──────▶│  StudentCourse   │       ┌──────────────────┐
              │   (Join Table)   │──────▶│     Course       │
              └──────────────────┘ N:1   │ (A-Level Combo)  │
                                         └──────────────────┘
                                                   │
┌─────────────┐       ┌──────────────────┐        │
│   Teacher   │──────▶│  TeacherSubject  │        │
│  (extends   │ 1:N   │   (Join Table)   │        │
│    User)    │       └──────────────────┘        │
└─────────────┘              │                     │
      │                      ▼                     ▼
      │ 1:N          ┌───────────────┐    ┌───────────────┐
      └─────────────▶│  SchoolClass  │◀───│   (Course)    │
                     │               │    └───────────────┘
                     └───────────────┘
                            │
                            │ 1:N
                            ▼
                     ┌───────────────┐
                     │    Student    │
                     └───────────────┘
```

### Relationship Summary

| From | To | Type | Via |
|------|-----|------|-----|
| Student | Subject | Many-to-Many | StudentSubject |
| Teacher | Subject | Many-to-Many | TeacherSubject |
| Student | Course | Many-to-Many | StudentCourse |
| Student | SchoolClass | Many-to-One | Direct FK |
| SchoolClass | Teacher | Many-to-One | classTeacher |
| SchoolClass | Course | Many-to-One | A-Level course |
| Student | Result | One-to-Many | Direct FK |
| Student | Attendance | One-to-Many | Direct FK |
| Exam | Subject | Many-to-One | Direct FK |
| Result | Exam | Many-to-One | Direct FK |

---

## Services Documentation

### StudentService
- CRUD operations for students
- Automatic student ID generation (`STU{year}{seq}`)
- Student promotion between classes/levels
- Statistics and search functionality

### TeacherService
- CRUD operations for teachers
- Automatic teacher ID generation (`TCH{year}{seq}`)
- Department and subject-based queries
- Class teacher assignment

### EnrollmentService
- Student-Subject enrollment management
- Course enrollment with automatic subject enrollment
- Teacher-Subject assignment
- Enrollment statistics

### ExamService
- Exam CRUD with scheduling
- Exam locking/unlocking mechanism
- Result publication workflow
- Exam analytics (pass rate, average, distribution)

### ResultService
- Result recording with automatic grading
- Bulk result entry
- Report card generation
- Class rankings calculation

### AttendanceService
- Individual and bulk attendance marking
- Attendance summary and reports
- Attendance statistics

### TimetableService
- Timetable entry management
- Conflict detection (teacher, room, class)
- Schedule queries by class/teacher/day

### SchoolClassService
- Class management with streams
- Class teacher assignment
- Default class initialization
- O-Level/A-Level class filtering

---

## Authentication & Authorization

### JWT Authentication Flow

1. User registers or logs in via `/api/auth/login`
2. Server validates credentials and returns JWT token
3. Client includes token in `Authorization: Bearer <token>` header
4. Server validates token on each request

### User Roles

| Role | Permissions |
|------|-------------|
| ADMIN | Full system access |
| HEAD_TEACHER | Teacher management, exam oversight |
| TEACHER | Own classes, attendance, results |
| STUDENT | View own data, timetable |
| PARENT | View child's data |

### Security Configuration

- BCrypt password hashing
- Token expiration (configurable)
- Role-based endpoint protection via `@PreAuthorize`

---

## Getting Started

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL (production) or H2 (development)

### Development Setup

```bash
# Clone repository
git clone https://github.com/Chemistry2i/Academix.git
cd Academix/server

# Run with H2 database (development)
./mvnw spring-boot:run

# Access H2 Console
# http://https://didactic-adventure-pjqpq9rpwqgqcr555-8080.app.github.dev/h2-console
```

### Production Setup

1. Configure `application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/academix
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update
```

2. Build and run:

```bash
./mvnw clean package
java -jar target/server-0.0.1-SNAPSHOT.jar
```

### Initialize Default Data

```bash
# Initialize subjects
POST /api/subjects/initialize

# Initialize courses (A-Level combinations)
POST /api/courses/initialize

# Initialize classes for academic year
POST /api/classes/initialize?academicYear=2024
```

---

## API Response Formats

### Success Response
```json
{
  "id": 1,
  "studentId": "STU2024001",
  "firstName": "John",
  "lastName": "Doe",
  "currentClass": "S3A",
  "status": "ACTIVE"
}
```

### Error Response
```json
{
  "error": "Student not found with id: 999"
}
```

### Paginated Response
```json
{
  "content": [...],
  "totalElements": 100,
  "totalPages": 10,
  "size": 10,
  "number": 0
}
```

---

## Future Enhancements

- [ ] Fee Management Module
- [ ] Parent/Guardian Module
- [ ] Notification System (Email/SMS)
- [ ] Report Generation (PDF)
- [ ] Academic Calendar Management
- [ ] Library Management
- [ ] Medical Records
- [ ] Inventory Management

---

**Documentation Version**: 1.0  
**Last Updated**: February 2026  
**Author**: Academix Development Team
