
package com.smarthostel.controller;

import com.smarthostel.entity.Outpass;
import com.smarthostel.repository.OutpassRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/security/outpasses")
@CrossOrigin(origins = "http://localhost:5173")
public class SecurityOutpassController {

    private final OutpassRepository outpassRepository;

    public SecurityOutpassController(
            OutpassRepository outpassRepository) {
        this.outpassRepository = outpassRepository;
    }

    // Verify barcode and record student exit
    @PutMapping("/exit/{barcode}")
    public ResponseEntity<?> verifyExit(
            @PathVariable String barcode) {

        Outpass outpass = outpassRepository
                .findByBarcode(barcode)
                .orElse(null);

        if (outpass == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid barcode. Outpass not found.");
        }

        if (!"APPROVED".equals(outpass.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Exit denied. Outpass is not approved or has already been used.");
        }

        outpass.setStatus("OUT");
        outpass.setActualExitTime(LocalDateTime.now());

        Outpass updatedOutpass =
                outpassRepository.save(outpass);

        return ResponseEntity.ok(updatedOutpass);
    }

    // Verify barcode and record student return
    @PutMapping("/return/{barcode}")
    public ResponseEntity<?> verifyReturn(
            @PathVariable String barcode) {

        Outpass outpass = outpassRepository
                .findByBarcode(barcode)
                .orElse(null);

        if (outpass == null) {
            return ResponseEntity.badRequest()
                    .body("Invalid barcode. Outpass not found.");
        }

        if (!"OUT".equals(outpass.getStatus())) {
            return ResponseEntity.badRequest()
                    .body("Return denied. Student has not been recorded as OUT.");
        }

        outpass.setStatus("RETURNED");
        outpass.setActualReturnTime(LocalDateTime.now());

        Outpass updatedOutpass =
                outpassRepository.save(outpass);

        return ResponseEntity.ok(updatedOutpass);
    }
}