package com.smarthostel.dto;

public class LoginResponse {

    private boolean success;
    private String message;
    private String username;
    private String role;
    private Long studentId;

    public LoginResponse() {
    }

    // Keeps existing four-argument calls working
    public LoginResponse(
            boolean success,
            String message,
            String username,
            String role) {

        this.success = success;
        this.message = message;
        this.username = username;
        this.role = role;
        this.studentId = null;
    }

    // Used when the account is linked to a student
    public LoginResponse(
            boolean success,
            String message,
            String username,
            String role,
            Long studentId) {

        this.success = success;
        this.message = message;
        this.username = username;
        this.role = role;
        this.studentId = studentId;
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public Long getStudentId() {
        return studentId;
    }
}