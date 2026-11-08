
package com.smarthostel.controller;

import com.smarthostel.entity.Bed;
import com.smarthostel.repository.BedRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/beds")
public class BedController {

    private final BedRepository bedRepository;

    public BedController(BedRepository bedRepository) {
        this.bedRepository = bedRepository;
    }

    // Add a new bed
    @PostMapping
    public Bed addBed(@RequestBody Bed bed) {
        return bedRepository.save(bed);
    }

    // Get all beds
    @GetMapping
    public List<Bed> getAllBeds() {
        return bedRepository.findAll();
    }

    // Get bed by ID
    @GetMapping("/{id}")
    public Bed getBedById(@PathVariable Long id) {
        return bedRepository.findById(id).orElse(null);
    }

    // Get all beds in a particular room
    @GetMapping("/room/{roomNumber}")
    public List<Bed> getBedsByRoom(@PathVariable String roomNumber) {
        return bedRepository.findByRoomNumber(roomNumber);
    }

    // Assign a student to a bed
    @PutMapping("/{bedId}/assign/{studentId}")
    public ResponseEntity<?> assignStudentToBed(
            @PathVariable Long bedId,
            @PathVariable Long studentId) {

        Bed bed = bedRepository.findById(bedId).orElse(null);

        if (bed == null) {
            return ResponseEntity.notFound().build();
        }

        if ("OCCUPIED".equalsIgnoreCase(bed.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Bed is already occupied and cannot be reassigned.");
        }

        bed.setStudentId(studentId);
        bed.setStatus("OCCUPIED");

        return ResponseEntity.ok(bedRepository.save(bed));
    }

    // Release a bed
    @PutMapping("/{bedId}/release")
    public ResponseEntity<?> releaseBed(@PathVariable Long bedId) {

        Bed bed = bedRepository.findById(bedId).orElse(null);

        if (bed == null) {
            return ResponseEntity.notFound().build();
        }

        if (!"OCCUPIED".equalsIgnoreCase(bed.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Bed is not occupied and cannot be released.");
        }

        bed.setStudentId(null);
        bed.setStatus("AVAILABLE");

        bedRepository.save(bed);

        return ResponseEntity.ok("Bed released successfully.");
    }

    // Update bed
    @PutMapping("/{id}")
    public Bed updateBed(
            @PathVariable Long id,
            @RequestBody Bed updatedBed) {

        Bed bed = bedRepository.findById(id).orElse(null);

        if (bed == null) {
            return null;
        }

        bed.setBedNumber(updatedBed.getBedNumber());
        bed.setRoomNumber(updatedBed.getRoomNumber());
        bed.setStatus(updatedBed.getStatus());
        bed.setStudentId(updatedBed.getStudentId());

        return bedRepository.save(bed);
    }

    // Delete bed
    @DeleteMapping("/{id}")
    public String deleteBed(@PathVariable Long id) {

        if (!bedRepository.existsById(id)) {
            return "Bed not found";
        }

        bedRepository.deleteById(id);

        return "Bed deleted successfully";
    }
}