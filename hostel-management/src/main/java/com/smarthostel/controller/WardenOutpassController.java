
package com.smarthostel.controller;

import com.smarthostel.entity.Outpass;
import com.smarthostel.repository.OutpassRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/warden/outpasses")
@CrossOrigin(origins = "http://localhost:5173")
public class WardenOutpassController {

    private final OutpassRepository outpassRepository;

    public WardenOutpassController(
            OutpassRepository outpassRepository) {
        this.outpassRepository = outpassRepository;
    }

    // View all pending requests
    @GetMapping("/pending")
    public List<Outpass> getPendingOutpasses() {
        return outpassRepository.findByStatus("PENDING");
    }

    // Approve an outpass and generate a unique barcode
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveOutpass(
            @PathVariable Long id) {

        Outpass outpass = outpassRepository
                .findById(id)
                .orElse(null);

        if (outpass == null) {
            return ResponseEntity.notFound().build();
        }

        if (!"PENDING".equals(outpass.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Only pending requests can be approved.");
        }

        // Generate a unique barcode for this trip
        String barcode = UUID.randomUUID().toString();

        outpass.setBarcode(barcode);
        outpass.setStatus("APPROVED");

        Outpass updatedOutpass =
                outpassRepository.save(outpass);

        return ResponseEntity.ok(updatedOutpass);
    }

    // Reject an outpass request
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectOutpass(
            @PathVariable Long id) {

        Outpass outpass = outpassRepository
                .findById(id)
                .orElse(null);

        if (outpass == null) {
            return ResponseEntity.notFound().build();
        }

        if (!"PENDING".equals(outpass.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Only pending requests can be rejected.");
        }

        outpass.setStatus("REJECTED");
        outpass.setBarcode(null);

        Outpass updatedOutpass =
                outpassRepository.save(outpass);

        return ResponseEntity.ok(updatedOutpass);
    }
}