
package com.smarthostel.controller;

import com.smarthostel.entity.Complaint;
import com.smarthostel.entity.Student;
import com.smarthostel.repository.ComplaintRepository;
import com.smarthostel.repository.StudentRepository;
import com.smarthostel.service.ComplaintService;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/complaints")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174"
}, allowCredentials = "true")
public class ComplaintController {

    private final ComplaintRepository complaintRepository;
    private final StudentRepository studentRepository;
    private final ComplaintService complaintService;

    public ComplaintController(
            ComplaintRepository complaintRepository,
            StudentRepository studentRepository,
            ComplaintService complaintService) {

        this.complaintRepository = complaintRepository;
        this.studentRepository = studentRepository;
        this.complaintService = complaintService;
    }

    // Get all complaints
    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    // Get complaints for one student
    @GetMapping("/student/{studentId}")
    public List<Complaint> getStudentComplaints(
            @PathVariable Long studentId) {

        return complaintRepository.findByStudentId(studentId);
    }

    // Submit complaint with automatic priority classification
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Complaint createComplaint(
            @RequestBody ComplaintRequest request) {

        if (request.getStudentId() == null
                || request.getCategory() == null
                || request.getCategory().isBlank()
                || request.getDescription() == null
                || request.getDescription().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Student, category and description are required");
        }

        Student student = studentRepository
                .findById(request.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Student not found"));

        Complaint complaint = new Complaint();

        complaint.setStudent(student);

        String category = request.getCategory().trim();
        String description = request.getDescription().trim();

        complaint.setCategory(category);
        complaint.setDescription(description);

        // Automatically classify complaint priority
        String priority = complaintService.classifyPriority(
                category, description);

        complaint.setPriority(priority);
        complaint.setStatus("PENDING");

        return complaintRepository.save(complaint);
    }

    // Update complaint status
    @PatchMapping("/{id}/status")
    public Complaint updateStatus(
            @PathVariable Long id,
            @RequestBody StatusRequest request) {

        if (request.getStatus() == null
                || !List.of(
                        "PENDING",
                        "IN_PROGRESS",
                        "RESOLVED",
                        "REJECTED"
                ).contains(request.getStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid complaint status");
        }

        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Complaint not found"));

        complaint.setStatus(request.getStatus());

        return complaintRepository.save(complaint);
    }

    public static class ComplaintRequest {

        private Long studentId;
        private String category;
        private String description;

        public Long getStudentId() {
            return studentId;
        }

        public void setStudentId(Long studentId) {
            this.studentId = studentId;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }
    }

    public static class StatusRequest {

        private String status;

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }
    }
}
