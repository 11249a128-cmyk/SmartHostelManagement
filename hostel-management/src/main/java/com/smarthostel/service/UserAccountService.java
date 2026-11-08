
package com.smarthostel.service;

import com.smarthostel.entity.Student;
import com.smarthostel.entity.UserAccount;
import com.smarthostel.repository.StudentRepository;
import com.smarthostel.repository.UserAccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Set;

@Service
public class UserAccountService {

    private static final Set<String> ALLOWED_ROLES =
            Set.of("STUDENT", "WARDEN", "SECURITY", "ADMIN");

    private final UserAccountRepository userAccountRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public UserAccountService(
            UserAccountRepository userAccountRepository,
            StudentRepository studentRepository,
            PasswordEncoder passwordEncoder) {
        this.userAccountRepository = userAccountRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserAccount createAccount(
            String username, String password, String role) {

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }

        if (password == null || password.length() < 12) {
            throw new IllegalArgumentException(
                    "Password must be at least 12 characters long.");
        }

        if (role == null) {
            throw new IllegalArgumentException("Role is required.");
        }

        String cleanUsername = username.trim();
        String cleanRole = role.trim().toUpperCase(Locale.ROOT);

        if (!ALLOWED_ROLES.contains(cleanRole)) {
            throw new IllegalArgumentException("Invalid user role.");
        }

        if (userAccountRepository.existsByUsername(cleanUsername)) {
            throw new IllegalArgumentException(
                    "That username is already registered.");
        }

        UserAccount account = new UserAccount();
        account.setUsername(cleanUsername);
        account.setPasswordHash(passwordEncoder.encode(password));
        account.setRole(cleanRole);
        account.setEnabled(true);

        return userAccountRepository.save(account);
    }

    @Transactional
    public UserAccount resetExistingPassword(
            String username, String newPassword) {

        if (newPassword == null || newPassword.length() < 12) {
            throw new IllegalArgumentException(
                    "Password must be at least 12 characters long.");
        }

        UserAccount account = userAccountRepository
                .findByUsername(username.trim())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Admin account not found."));

        if (!"ADMIN".equals(account.getRole())) {
            throw new IllegalArgumentException(
                    "This account is not an admin account.");
        }

        account.setPasswordHash(passwordEncoder.encode(newPassword));

        return userAccountRepository.save(account);
    }

    @Transactional
    public UserAccount createStudentAccount(
            String username, String password, Long studentId) {

        if (studentId == null) {
            throw new IllegalArgumentException("Student ID is required.");
        }

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Student not found."));

        UserAccount account = createAccount(
                username, password, "STUDENT");

        account.setStudent(student);

        return userAccountRepository.save(account);
    }
}
