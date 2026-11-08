# Smart Hostel Management & AI-Based Student Support System

## Project Team
- D. Nitheesh
- A. Jithendra

## Project Overview
HostelHub is a web-based hostel management system designed to simplify hostel administration and student services.

## Main Features
- Admin, Warden, Student and Security dashboards
- Student and room management
- Digital outpass application and approval
- One-time barcode-based exit and return verification
- Complaint registration and priority classification
- AI Hostel Assistant
- Visitor management
- Fee management
- Mess food feedback
- Notices and announcements
- Dashboard analytics

## Technologies Used
- Frontend: React, Vite, JavaScript, CSS
- Backend: Java, Spring Boot, Maven
- Database: MySQL

## Requirements
- Java JDK 25
- Node.js and npm
- MySQL 8
- Git

## Database Setup
1. Start MySQL.
2. Create the database:

   CREATE DATABASE hostel_management;

3. Import database/hostel_schema.sql.
4. Import database/demo_data.sql.

Import both SQL files using MySQL Workbench or the MySQL command line.

## Run Backend
Open a terminal in the hostel-management folder.

Set your own MySQL password:

$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"

Set your own demo account credentials (minimum 12 characters):

$env:HOSTEL_ADMIN_USERNAME="demo.admin"
$env:HOSTEL_ADMIN_PASSWORD="YOUR_ADMIN_PASSWORD"

$env:WARDEN_USERNAME="demo.warden"
$env:WARDEN_PASSWORD="YOUR_WARDEN_PASSWORD"

$env:STUDENT_USERNAME="demo.student"
$env:STUDENT_PASSWORD="YOUR_STUDENT_PASSWORD"
$env:STUDENT_ID="1"

$env:SECURITY_USERNAME="demo.security"
$env:SECURITY_PASSWORD="YOUR_SECURITY_PASSWORD"

Run:

.\mvnw.cmd spring-boot:run

Backend: http://localhost:8080

## Run Frontend
Open another terminal in the frontend folder.

Run:

npm install
npm run dev

Frontend: http://localhost:5173

## Important
Use your own local MySQL password and private demo account passwords. Do not publish passwords or real student records.

This is an academic project prototype.
