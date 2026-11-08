package com.smarthostel.controller;

import com.smarthostel.dto.LoginResponse;
import com.smarthostel.entity.Student;
import com.smarthostel.entity.UserAccount;
import com.smarthostel.repository.UserAccountRepository;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserAccountRepository userAccountRepository;

    private final SecurityContextRepository securityContextRepository =
            new HttpSessionSecurityContextRepository();

    public AuthController(
            AuthenticationManager authenticationManager,
            UserAccountRepository userAccountRepository) {

        this.authenticationManager = authenticationManager;
        this.userAccountRepository = userAccountRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody com.smarthostel.dto.LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {

        try {
            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    request.getUsername(),
                                    request.getPassword()
                            )
                    );

            SecurityContext context =
                    SecurityContextHolder.createEmptyContext();

            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);

            securityContextRepository.saveContext(
                    context, httpRequest, httpResponse
            );

            String role = authentication.getAuthorities()
                    .iterator()
                    .next()
                    .getAuthority()
                    .replace("ROLE_", "");

            Long studentId = findStudentId(authentication.getName());

            return ResponseEntity.ok(
                    new LoginResponse(
                            true,
                            "Login successful.",
                            authentication.getName(),
                            role,
                            studentId
                    )
            );

        } catch (
                org.springframework.security.core.AuthenticationException ex) {

            SecurityContextHolder.clearContext();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(
                            false,
                            "Invalid username or password.",
                            null,
                            null,
                            null
                    ));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(
            Authentication authentication) {

        if (authentication == null
                || !authentication.isAuthenticated()
                || (authentication.getPrincipal() instanceof String
                && authentication.getPrincipal().equals("anonymousUser"))) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Please log in."));
        }

        String role = authentication.getAuthorities()
                .iterator()
                .next()
                .getAuthority()
                .replace("ROLE_", "");

        Long studentId = findStudentId(authentication.getName());

        return ResponseEntity.ok(
                new LoginResponse(
                        true,
                        "You are logged in.",
                        authentication.getName(),
                        role,
                        studentId
                )
        );
    }

    private Long findStudentId(String username) {

        return userAccountRepository.findByUsername(username)
                .map(UserAccount::getStudent)
                .map(Student::getId)
                .orElse(null);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            HttpServletRequest request,
            HttpServletResponse response) {

        new org.springframework.security.web.authentication.logout
                .SecurityContextLogoutHandler()
                .logout(
                        request,
                        response,
                        SecurityContextHolder.getContext()
                                .getAuthentication()
                );

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok(
                Map.of("message", "Logged out successfully.")
        );
    }
}