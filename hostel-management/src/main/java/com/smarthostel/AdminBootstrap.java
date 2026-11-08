
package com.smarthostel;

import com.smarthostel.repository.UserAccountRepository;
import com.smarthostel.service.UserAccountService;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AdminBootstrap {

    @Bean
    public ApplicationRunner createInitialAccounts(
            UserAccountRepository userAccountRepository,
            UserAccountService userAccountService) {

        return args -> {

            // ADMIN ACCOUNT
            String adminUsername =
                    System.getenv("HOSTEL_ADMIN_USERNAME");

            String adminPassword =
                    System.getenv("HOSTEL_ADMIN_PASSWORD");

            String resetPassword =
                    System.getenv("HOSTEL_ADMIN_RESET_PASSWORD");

            if (adminUsername != null && !adminUsername.isBlank()) {

                String cleanUsername = adminUsername.trim();

                if (resetPassword != null && !resetPassword.isBlank()) {

                    userAccountService.resetExistingPassword(
                            cleanUsername, resetPassword);

                    System.out.println("Admin password reset successfully.");

                } else if (adminPassword != null
                        && !adminPassword.isBlank()
                        && !userAccountRepository.existsByUsername(
                                cleanUsername)) {

                    userAccountService.createAccount(
                            cleanUsername, adminPassword, "ADMIN");

                    System.out.println("Initial admin account created.");

                } else {
                    System.out.println(
                            "Admin account already exists or setup skipped.");
                }
            }

            // STUDENT ACCOUNT
            String studentUsername =
                    System.getenv("STUDENT_USERNAME");

            String studentPassword =
                    System.getenv("STUDENT_PASSWORD");

            String studentIdValue =
                    System.getenv("STUDENT_ID");

            if (studentUsername != null && !studentUsername.isBlank()
                    && studentPassword != null && !studentPassword.isBlank()
                    && studentIdValue != null && !studentIdValue.isBlank()) {

                if (!userAccountRepository.existsByUsername(
                        studentUsername.trim())) {

                    Long studentId = Long.parseLong(studentIdValue.trim());

                    userAccountService.createStudentAccount(
                            studentUsername.trim(),
                            studentPassword,
                            studentId);

                    System.out.println("Student test account created.");
                }
            } else {
                System.out.println(
                        "Student setup skipped: environment variables not set.");
            }

            // WARDEN ACCOUNT
            String wardenUsername =
                    System.getenv("WARDEN_USERNAME");

            String wardenPassword =
                    System.getenv("WARDEN_PASSWORD");

            if (wardenUsername != null && !wardenUsername.isBlank()
                    && wardenPassword != null && !wardenPassword.isBlank()) {

                if (!userAccountRepository.existsByUsername(
                        wardenUsername.trim())) {

                    userAccountService.createAccount(
                            wardenUsername.trim(),
                            wardenPassword,
                            "WARDEN");

                    System.out.println("Warden account created.");
                } else {
                    System.out.println("Warden account already exists.");
                }

            } else {
                System.out.println(
                        "Warden setup skipped: environment variables not set.");
            }

            // SECURITY ACCOUNT
            String securityUsername =
                    System.getenv("SECURITY_USERNAME");

            String securityPassword =
                    System.getenv("SECURITY_PASSWORD");

            if (securityUsername != null && !securityUsername.isBlank()
                    && securityPassword != null && !securityPassword.isBlank()) {

                if (!userAccountRepository.existsByUsername(
                        securityUsername.trim())) {

                    userAccountService.createAccount(
                            securityUsername.trim(),
                            securityPassword,
                            "SECURITY");

                    System.out.println("Security account created.");
                } else {
                    System.out.println("Security account already exists.");
                }

            } else {
                System.out.println(
                        "Security setup skipped: environment variables not set.");
            }
        };
    }
}
