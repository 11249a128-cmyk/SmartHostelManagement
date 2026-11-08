
package com.smarthostel.controller;

import com.smarthostel.entity.Outpass;
import com.smarthostel.repository.OutpassRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/outpasses")
@CrossOrigin(origins = "http://localhost:5173")
public class OutpassController {

    private final OutpassRepository outpassRepository;

    public OutpassController(OutpassRepository outpassRepository) {
        this.outpassRepository = outpassRepository;
    }

    // Submit a new outpass request
    @PostMapping
    public ResponseEntity<?> applyOutpass(@RequestBody Outpass outpass) {

        if (outpass.getStudentId() == null
                || outpass.getDestination() == null
                || outpass.getReason() == null
                || outpass.getDepartureTime() == null
                || outpass.getExpectedReturnTime() == null) {

            return ResponseEntity.badRequest()
                    .body("Please provide all required outpass details.");
        }

        if (outpass.getExpectedReturnTime()
                .isBefore(outpass.getDepartureTime())
                || outpass.getExpectedReturnTime()
                .isEqual(outpass.getDepartureTime())) {

            return ResponseEntity.badRequest()
                    .body("Return time must be after departure time.");
        }

        // New requests always start as pending
        outpass.setId(null);
        outpass.setStatus("PENDING");
        outpass.setBarcode(null);
        outpass.setActualExitTime(null);
        outpass.setActualReturnTime(null);

        Outpass savedOutpass = outpassRepository.save(outpass);

        return ResponseEntity.ok(savedOutpass);
    }

    // Get all outpass requests
    @GetMapping
    public List<Outpass> getAllOutpasses() {
        return outpassRepository.findAll();
    }

    // Get outpass history for a student
    @GetMapping("/student/{studentId}")
    public List<Outpass> getStudentOutpasses(
            @PathVariable Long studentId) {

        return outpassRepository.findByStudentId(studentId);
    }

    // Get requests by status
    @GetMapping("/status/{status}")
    public List<Outpass> getOutpassesByStatus(
            @PathVariable String status) {

        return outpassRepository.findByStatus(status.toUpperCase());
    }

    // Get a specific outpass by ID
    @GetMapping("/{id}")
    public ResponseEntity<Outpass> getOutpassById(
            @PathVariable Long id) {

        return outpassRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}