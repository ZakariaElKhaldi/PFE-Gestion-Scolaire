# School Management System - API Endpoints & Screens

This document lists all REST API endpoints required to fulfill the project needs, along with the corresponding web/mobile pages/screens.

---

## 1. Auth & User Management

### Endpoints
- POST   /api/auth/register                (User registration)
- POST   /api/auth/login                   (User login)
- POST   /api/auth/logout                  (User logout)
- POST   /api/auth/forgot-password         (Request password reset)
- POST   /api/auth/reset-password          (Reset password)
- GET    /api/auth/me                      (Get current user profile)
- PUT    /api/users/:id/profile            (Update user profile)
- GET    /api/users/:id                    (Get user by ID)
- GET    /api/users                        (List/search users)
- POST   /api/users                        (Create user - admin)
- PUT    /api/users/:id                    (Update user - admin)
- DELETE /api/users/:id                    (Delete user - admin)
- GET    /api/roles                        (List roles)
- POST   /api/roles                        (Create role)
- POST   /api/users/:id/avatar             (Upload/change avatar)

### Screens/Pages
- Login
- Register
- Forgot Password
- Profile (view/edit)
- User Management (admin)

---

## 2. Registration & Payments

### Endpoints
- POST   /api/registrations                (Student registration)
- GET    /api/registrations                (List/view registrations)
- PUT    /api/registrations/:id            (Update registration status)
- GET    /api/payments                     (List payments)
- POST   /api/payments/checkout            (Initiate payment - Stripe/PayPal)
- GET    /api/payments/:id                 (Get payment details)
- GET    /api/invoices                     (List invoices)
- GET    /api/invoices/:id/download        (Download invoice PDF)
- GET    /api/notifications                (List notifications)

### Screens/Pages
- Registration Form
- Payment Page
- Payment History
- Invoice Download
- Payment Notifications

---

## 3. Courses, Classes & Resources

### Endpoints
- GET    /api/courses                      (List/search courses)
- GET    /api/courses/:id                  (Get course details)
- POST   /api/courses                      (Create course - admin/teacher)
- PUT    /api/courses/:id                  (Update course)
- DELETE /api/courses/:id                  (Delete course)
- GET    /api/classes                      (List/search classes)
- GET    /api/classes/:id                  (Get class details)
- POST   /api/classes                      (Create class)
- PUT    /api/classes/:id                  (Update class)
- DELETE /api/classes/:id                  (Delete class)
- GET    /api/materials                    (List/search materials)
- POST   /api/materials                    (Upload material)
- GET    /api/materials/:id/download       (Download material)
- GET    /api/library                      (Digital library search)

### Screens/Pages
- Courses List
- Course Details
- Class List
- Class Details
- Materials/Resources
- Digital Library

---

## 4. Attendance Management

### Endpoints
- GET    /api/attendance                   (List attendance records)
- POST   /api/attendance                   (Mark attendance)
- PUT    /api/attendance/:id               (Update attendance)
- GET    /api/attendance/report            (Export attendance report PDF/Excel)
- GET    /api/notifications                (Absence notifications)

### Screens/Pages
- Attendance Marking
- Attendance Report
- Absence Notifications

---

## 5. Assignments & Evaluations

### Endpoints
- GET    /api/assignments                  (List assignments)
- POST   /api/assignments                  (Create assignment)
- GET    /api/assignments/:id              (Assignment details)
- PUT    /api/assignments/:id              (Update assignment)
- DELETE /api/assignments/:id              (Delete assignment)
- POST   /api/assignments/:id/submit       (Submit assignment)
- GET    /api/assignments/:id/submissions  (List submissions)
- POST   /api/assignments/:id/grade        (Grade submission)
- GET    /api/evaluations                  (List evaluations/exams)
- POST   /api/evaluations                  (Create evaluation/exam)
- GET    /api/evaluations/:id              (Evaluation details)
- POST   /api/evaluations/:id/submit       (Submit evaluation)
- POST   /api/evaluations/:id/grade        (Grade evaluation)
- GET    /api/notifications                (Assignment notifications)

### Screens/Pages
- Assignments List
- Assignment Details
- Assignment Submission
- Assignment Grading
- Evaluations/Exams
- Evaluation Submission
- Evaluation Grading

---

## 6. Performance Tracking

### Endpoints
- GET    /api/performance                  (Student performance dashboard)
- GET    /api/performance/:studentId       (Performance details)
- GET    /api/performance/report           (Export performance report)

### Screens/Pages
- Performance Dashboard
- Performance Details
- Parent Progress View

---

## 7. Communication & Notifications

### Endpoints
- GET    /api/messages                     (List messages/conversations)
- POST   /api/messages                     (Send message)
- GET    /api/messages/:id                 (Get conversation)
- POST   /api/announcements                (Create announcement)
- GET    /api/announcements                (List announcements)
- GET    /api/announcements/:id            (Announcement details)
- POST   /api/newsletters/send             (Send newsletter)
- GET    /api/notifications                (List notifications)
- POST   /api/notifications/read           (Mark as read)
- POST   /api/push/register                (Register device for push)

### Screens/Pages
- Messaging/Chat
- Announcements
- Newsletters
- Notifications

---

## 8. Timetable & Calendar

### Endpoints
- GET    /api/timetable                    (Get timetable/calendar)
- POST   /api/timetable                    (Create/update timetable)
- GET    /api/timetable/export             (Export timetable PDF)
- GET    /api/notifications                (Timetable change notifications)

### Screens/Pages
- Timetable/Calendar
- Timetable Export
- Timetable Notifications

---

## 9. Admin Portal & Analytics

### Endpoints
- GET    /api/admin/dashboard              (Admin dashboard/analytics)
- GET    /api/admin/statistics             (Statistics reports)
- GET    /api/admin/activities             (Activity logs)
- GET    /api/reports                      (List reports)
- POST   /api/reports/generate             (Generate report)
- GET    /api/reports/:id/download         (Download report)

### Screens/Pages
- Admin Dashboard
- Analytics/Statistics
- Activity Logs
- Reports

---

## 10. Certificates & Attestations

### Endpoints
- GET    /api/certificates                 (List certificates)
- POST   /api/certificates                 (Generate certificate)
- GET    /api/certificates/:id/download    (Download certificate)
- GET    /api/certificates/verify/:code    (Verify certificate QR)

### Screens/Pages
- Certificates List
- Certificate Download
- Certificate Verification

---

## 11. Support & Assistance

### Endpoints
- GET    /api/faq                          (List FAQ)
- POST   /api/faq                          (Create FAQ - admin)
- GET    /api/support/tickets              (List support tickets)
- POST   /api/support/tickets              (Create support ticket)
- GET    /api/support/tickets/:id          (View ticket)
- POST   /api/support/tickets/:id/reply    (Reply to ticket)
- POST   /api/support/tickets/:id/close    (Close ticket)
- GET    /api/support/chat                 (Start/continue live chat)
- POST   /api/support/chat/message         (Send chat message)

### Screens/Pages
- FAQ
- Support Tickets
- Ticket Details/Reply
- Live Chat

---

## 12. Settings & Preferences

### Endpoints
- GET    /api/settings                     (Get user/system settings)
- PUT    /api/settings                     (Update settings)
- GET    /api/preferences                  (Get user preferences)
- PUT    /api/preferences                  (Update preferences)

### Screens/Pages
- Settings
- Preferences

---

## 13. Miscellaneous

### Endpoints
- GET    /api/audit-logs                   (System audit logs)
- GET    /api/files/:id/download           (Download file)
- POST   /api/files/upload                 (Upload file)

### Screens/Pages
- File Upload
- File Download
- Audit Logs

---

## Notes
- All endpoints are prefixed with `/api/`.
- All endpoints require authentication unless otherwise specified (e.g., login, register, password reset, certificate verification).
- Some endpoints may be further restricted by role (admin, teacher, student, parent).
- This list covers all core requirements from the Cahier des Charges and can be extended as needed.
