-- HostelHub faculty demonstration data
-- Import this AFTER hostel_schema.sql into a fresh hostel_management database.
-- All student names, emails, phone numbers and records below are fictional.
-- Login accounts are intentionally NOT inserted here. AdminBootstrap.java creates them.

USE hostel_management;

-- Students
INSERT INTO student (id, name, department, email, phone, room_number, year) VALUES
(1, 'Demo Student One', 'CSE', 'student1@example.com', '9000000001', 'A101', '2'),
(2, 'Demo Student Two', 'ECE', 'student2@example.com', '9000000002', 'A101', '2'),
(3, 'Demo Student Three', 'IT', 'student3@example.com', '9000000003', 'A101', '3'),
(4, 'Demo Student Four', 'CSE', 'student4@example.com', '9000000004', 'A101', '1'),
(5, 'Demo Student Five', 'ECE', 'student5@example.com', '9000000005', 'A102', '2'),
(6, 'Demo Student Six', 'IT', 'student6@example.com', '9000000006', 'A102', '3');

-- Rooms and beds
INSERT INTO room (id, room_number, hostel_name, floor, capacity) VALUES
(1, 'A101', 'Demo Hostel', '1', 4),
(2, 'A102', 'Demo Hostel', '1', 4);

INSERT INTO bed (id, bed_number, room_number, status, student_id) VALUES
(1, 'A101-B1', 'A101', 'OCCUPIED', 1),
(2, 'A101-B2', 'A101', 'OCCUPIED', 2),
(3, 'A101-B3', 'A101', 'AVAILABLE', NULL),
(4, 'A101-B4', 'A101', 'AVAILABLE', NULL),
(5, 'A102-B1', 'A102', 'OCCUPIED', 5),
(6, 'A102-B2', 'A102', 'AVAILABLE', NULL),
(7, 'A102-B3', 'A102', 'AVAILABLE', NULL),
(8, 'A102-B4', 'A102', 'AVAILABLE', NULL);

-- Complaints
INSERT INTO complaint (id, student_id, category, description, priority, status, created_at) VALUES
(1, 1, 'Electrical', 'Demo: corridor light needs repair.', 'MEDIUM', 'PENDING', '2026-11-01 09:00:00'),
(2, 2, 'Water', 'Demo: water supply needs checking.', 'HIGH', 'IN_PROGRESS', '2026-11-02 10:30:00'),
(3, 3, 'Cleaning', 'Demo: common area cleaning request.', 'LOW', 'RESOLVED', '2026-11-03 11:15:00');

-- Outpasses (sample historical records; use the application to test new trips)
INSERT INTO outpasses
(id, student_id, outpass_type, destination, reason, departure_time, expected_return_time,
 actual_exit_time, actual_return_time, status, barcode, created_at) VALUES
(1, 1, 'LOCAL', 'Demo Market', 'Demo personal work',
 '2026-11-01 14:00:00', '2026-11-01 17:00:00',
 '2026-11-01 14:05:00', '2026-11-01 16:45:00',
 'RETURNED', 'DEMO-OUTPASS-0001', '2026-11-01 09:00:00'),
(2, 2, 'HOME', 'Demo Home Town', 'Demo weekend visit',
 '2026-11-04 08:00:00', '2026-11-06 18:00:00',
 '2026-11-04 08:10:00', '2026-11-06 17:40:00',
 'RETURNED', 'DEMO-OUTPASS-0002', '2026-11-03 12:00:00');

-- Visitor records
INSERT INTO visitor
(id, visitor_name, phone, relationship, student_visited, visit_date, visit_time) VALUES
(1, 'Demo Visitor', '9000000010', 'Parent', 'Demo Student One', '2026-11-05', '15:00:00');

-- Fee records
INSERT INTO fee_records
(id, student_id, amount, created_at, description, due_date, fee_type, payment_status) VALUES
(1, 1, 12000.00, '2026-11-01 09:00:00', 'Demo semester hostel fee', '2026-11-30', 'HOSTEL', 'PAID'),
(2, 2, 12000.00, '2026-11-01 09:00:00', 'Demo semester hostel fee', '2026-11-30', 'HOSTEL', 'PENDING');

-- Mess feedback
INSERT INTO mess_feedback
(id, student_id, comments, created_at, meal_type, rating) VALUES
(1, 1, 'Demo feedback: meal was satisfactory.', '2026-11-05 13:00:00', 'LUNCH', 4),
(2, 2, 'Demo feedback: please add more variety.', '2026-11-05 20:00:00', 'DINNER', 3);

-- Notices (text-only examples; no uploaded image files are required)
INSERT INTO notice
(id, category, created_at, created_by, description, image_path, title) VALUES
(1, 'GENERAL', '2026-11-01 08:00:00', 'Demo Admin',
 'This is a sample notice for the faculty demonstration.', NULL, 'Welcome to HostelHub'),
(2, 'EVENT', '2026-11-02 08:00:00', 'Demo Warden',
 'This is a fictional sample announcement.', NULL, 'Demo Hostel Announcement');
