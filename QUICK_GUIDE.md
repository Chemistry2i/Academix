# Academix Run Guide (Boss Version)

This guide explains how to run the Academix project and how to use the HTML pages for testing.

## 1. What You Need

Install these tools first:

- Java `17` (required by backend)
- Node.js `18+` and npm (for frontend)
- Internet connection (first run downloads dependencies)

Optional checks:

```bash
java -version
node -v
npm -v
```

## 2. Project Structure (Simple View)

- `server/` = Java Spring Boot backend (API + static HTML test pages)
- `frontend/` = React app (main web interface)

## 3. Start the Backend (Server)

From project root (`Academix`):

```bash
cd server
./mvnw spring-boot:run
```

If startup is successful, backend runs on:

- `http://localhost:8080`

Useful backend URLs:

- API base: `http://localhost:8080/api`
- H2 database console: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:academixdb`
  - Username: `sa`
  - Password: `password`

## 4. Start the Frontend (Main App)

Open a second terminal window/tab and run:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

- `http://localhost:3000`

Important:

- Keep backend running while using frontend.
- Frontend calls backend API through Vite proxy.

## 5. How To Use the HTML Files

The project includes plain HTML test pages in `server/src/main/resources/static/`.

Best way to use them:

1. Start backend (`./mvnw spring-boot:run`)
2. Open them in browser through `localhost:8080` (not by double-clicking file)

Examples:

- Main static page: `http://localhost:8080/index.html`
- Auth tester: `http://localhost:8080/auth-test.html`
- Student registration page: `http://localhost:8080/student-registration.html`
- User endpoints tester: `http://localhost:8080/test-user-endpoints.html`
- API tests home: `http://localhost:8080/api-tests/index.html`

Other API test pages:

- `http://localhost:8080/api-tests/attendance.html`
- `http://localhost:8080/api-tests/auth.html`
- `http://localhost:8080/api-tests/classes.html`
- `http://localhost:8080/api-tests/courses.html`
- `http://localhost:8080/api-tests/enrollments.html`
- `http://localhost:8080/api-tests/exams.html`
- `http://localhost:8080/api-tests/grades.html`
- `http://localhost:8080/api-tests/results.html`
- `http://localhost:8080/api-tests/students.html`
- `http://localhost:8080/api-tests/subjects.html`
- `http://localhost:8080/api-tests/teachers.html`
- `http://localhost:8080/api-tests/timetable.html`

## 6. Everyday Run (Quick Start)

When dependencies are already installed:

Terminal 1:

```bash
cd server
./mvnw spring-boot:run
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Then open:

- Main app: `http://localhost:3000`
- HTML test pages: `http://localhost:8080/...`

## 7. How To Stop

- In each terminal, press `Ctrl + C`

## 8. Common Issues

`Port already in use`:

- Something else is using `8080` or `3000`.
- Close the old process, then rerun commands.

`npm install fails`:

- Check internet connection and try again.

`Frontend loads but data fails`:

- Backend is not running.
- Restart backend first, then refresh browser.

`HTML file opened directly has errors`:

- Use `http://localhost:8080/...` URLs instead of opening files directly from disk.
