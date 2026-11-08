
package com.smarthostel.controller;

import com.smarthostel.entity.FeeRecord;
import com.smarthostel.entity.Student;
import com.smarthostel.entity.UserAccount;
import com.smarthostel.repository.FeeRecordRepository;
import com.smarthostel.repository.StudentRepository;
import com.smarthostel.repository.UserAccountRepository;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/fees")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class FeeController {

    private final FeeRecordRepository feeRepository;
    private final StudentRepository studentRepository;
    private final UserAccountRepository userAccountRepository;

    public FeeController(
            FeeRecordRepository feeRepository,
            StudentRepository studentRepository,
            UserAccountRepository userAccountRepository) {

        this.feeRepository = feeRepository;
        this.studentRepository = studentRepository;
        this.userAccountRepository = userAccountRepository;
    }

    private void requireRole(Authentication auth, String role) {
        if (auth == null || !auth.isAuthenticated()
                || auth.getAuthorities().stream()
                .noneMatch(a -> a.getAuthority().equals("ROLE_" + role))) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, "Access denied."
            );
        }
    }

    // ADMIN: View all fee records
    @GetMapping("/admin")
    public List<FeeRecord> getAllFees(Authentication auth) {
        requireRole(auth, "ADMIN");

        return feeRepository.findAll(
            Sort.by(Sort.Direction.DESC, "createdAt")
        );
    }

    // STUDENT: View only the logged-in student's fees
    @GetMapping("/my")
    public List<FeeRecord> getMyFees(Authentication auth) {
        requireRole(auth, "STUDENT");

        UserAccount account = userAccountRepository
            .findByUsername(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student account not found."
            ));

        if (account.getStudent() == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "No student profile is linked."
            );
        }

        return feeRepository
            .findByStudent_IdOrderByCreatedAtDesc(
                account.getStudent().getId()
            );
    }

    // ADMIN: Add a fee record
    @PostMapping
    public FeeRecord addFee(
            @RequestBody FeeRecord request,
            Authentication auth) {

        requireRole(auth, "ADMIN");

        if (request.getStudent() == null
                || request.getStudent().getId() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Select a student."
            );
        }

        if (request.getFeeType() == null
                || request.getFeeType().isBlank()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Fee type is required."
            );
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Enter a valid fee amount."
            );
        }

        Student student = studentRepository
            .findById(request.getStudent().getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student not found."
            ));

        String status = request.getPaymentStatus() == null
            ? "UNPAID"
            : request.getPaymentStatus().toUpperCase();

        if (!status.equals("PAID") && !status.equals("UNPAID")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid payment status."
            );
        }

        FeeRecord fee = new FeeRecord();
        fee.setStudent(student);
        fee.setFeeType(request.getFeeType().trim());
        fee.setAmount(amount);
        fee.setDueDate(request.getDueDate());
        fee.setDescription(request.getDescription());
        fee.setPaymentStatus(status);

        return feeRepository.save(fee);
    }

    // ADMIN: Update payment status
    @PutMapping("/{id}/status")
    public FeeRecord updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication auth) {

        requireRole(auth, "ADMIN");

        String status = request.get("paymentStatus");

        if (status == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Payment status is required."
            );
        }

        status = status.toUpperCase();

        if (!status.equals("PAID") && !status.equals("UNPAID")) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid payment status."
            );
        }

        FeeRecord fee = feeRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Fee record not found."
            ));

        fee.setPaymentStatus(status);

        return feeRepository.save(fee);
    }
}
