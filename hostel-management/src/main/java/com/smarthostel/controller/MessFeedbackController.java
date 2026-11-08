
package com.smarthostel.controller;

import com.smarthostel.entity.MessFeedback;
import com.smarthostel.entity.Student;
import com.smarthostel.entity.UserAccount;
import com.smarthostel.repository.MessFeedbackRepository;
import com.smarthostel.repository.StudentRepository;
import com.smarthostel.repository.UserAccountRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/mess-feedback")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class MessFeedbackController {

    private final MessFeedbackRepository feedbackRepository;
    private final StudentRepository studentRepository;
    private final UserAccountRepository userAccountRepository;

    public MessFeedbackController(
            MessFeedbackRepository feedbackRepository,
            StudentRepository studentRepository,
            UserAccountRepository userAccountRepository) {

        this.feedbackRepository = feedbackRepository;
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

    // STUDENT: Submit feedback
    @PostMapping
    public MessFeedback submitFeedback(
            @RequestBody Map<String, Object> request,
            Authentication auth) {

        requireRole(auth, "STUDENT");

        String mealType = String.valueOf(request.get("mealType"));
        String comments = request.get("comments") == null
            ? ""
            : String.valueOf(request.get("comments"));

        Integer rating;

        try {
            rating = Integer.valueOf(
                String.valueOf(request.get("rating"))
            );
        } catch (Exception e) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Enter a valid rating."
            );
        }

        if (!List.of("Breakfast", "Lunch", "Snacks", "Dinner")
                .contains(mealType)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Invalid meal type."
            );
        }

        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5."
            );
        }

        if (comments.length() > 1000) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, "Feedback is too long."
            );
        }

        UserAccount account = userAccountRepository
            .findByUsername(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student account not found."
            ));

        if (account.getStudent() == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student profile not found."
            );
        }

        Student student = studentRepository
            .findById(account.getStudent().getId())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student not found."
            ));

        MessFeedback feedback = new MessFeedback();
        feedback.setStudent(student);
        feedback.setMealType(mealType);
        feedback.setRating(rating);
        feedback.setComments(comments);

        return feedbackRepository.save(feedback);
    }

    // STUDENT: View own feedback
    @GetMapping("/my")
    public List<MessFeedback> getMyFeedback(Authentication auth) {
        requireRole(auth, "STUDENT");

        UserAccount account = userAccountRepository
            .findByUsername(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student account not found."
            ));

        if (account.getStudent() == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND, "Student profile not found."
            );
        }

        return feedbackRepository
            .findByStudent_IdOrderByCreatedAtDesc(
                account.getStudent().getId()
            );
    }

    // ADMIN: View all feedback
    @GetMapping("/admin")
    public List<MessFeedback> getAllFeedback(Authentication auth) {
        requireRole(auth, "ADMIN");
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }

    // WARDEN: View all feedback
    @GetMapping("/warden")
    public List<MessFeedback> getWardenFeedback(Authentication auth) {
        requireRole(auth, "WARDEN");
        return feedbackRepository.findAllByOrderByCreatedAtDesc();
    }
}
