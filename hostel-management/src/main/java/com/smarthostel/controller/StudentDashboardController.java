
package com.smarthostel.controller;

import com.smarthostel.entity.Student;
import com.smarthostel.entity.Bed;
import com.smarthostel.entity.Room;

import com.smarthostel.repository.StudentRepository;
import com.smarthostel.repository.BedRepository;
import com.smarthostel.repository.RoomRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "http://localhost:5173")
public class StudentDashboardController {

    private final StudentRepository studentRepository;
    private final BedRepository bedRepository;
    private final RoomRepository roomRepository;

    public StudentDashboardController(
            StudentRepository studentRepository,
            BedRepository bedRepository,
            RoomRepository roomRepository) {

        this.studentRepository = studentRepository;
        this.bedRepository = bedRepository;
        this.roomRepository = roomRepository;
    }

    // Get student dashboard
    @GetMapping("/{studentId}/dashboard")
    public ResponseEntity<?> getStudentDashboard(
            @PathVariable Long studentId) {

        Student student = studentRepository
                .findById(studentId)
                .orElse(null);

        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        Map<String, Object> dashboard = new LinkedHashMap<>();

        // Student personal details
        dashboard.put("studentId", student.getId());
        dashboard.put("name", student.getName());
        dashboard.put("email", student.getEmail());
        dashboard.put("phone", student.getPhone());
        dashboard.put("department", student.getDepartment());
        dashboard.put("year", student.getYear());

        // Find assigned bed
        Bed bed = bedRepository
                .findByStudentId(studentId)
                .orElse(null);

        if (bed != null) {

            dashboard.put("bedNumber", bed.getBedNumber());
            dashboard.put("bedStatus", bed.getStatus());
            dashboard.put("roomNumber", bed.getRoomNumber());

            // Find room details
            Room room = roomRepository.findAll()
                    .stream()
                    .filter(r -> r.getRoomNumber()
                            .equals(bed.getRoomNumber()))
                    .findFirst()
                    .orElse(null);

            if (room != null) {
                dashboard.put("hostelName", room.getHostelName());
                dashboard.put("floor", room.getFloor());
            }

        } else {

            dashboard.put("bedNumber", null);
            dashboard.put("bedStatus", "NOT_ASSIGNED");
            dashboard.put("roomNumber", null);
            dashboard.put("hostelName", null);
            dashboard.put("floor", null);
        }

        return ResponseEntity.ok(dashboard);
    }
}