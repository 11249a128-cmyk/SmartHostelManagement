
package com.smarthostel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "outpasses")
public class Outpass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId;

    private String outpassType;

    private String destination;

    private String reason;

    private LocalDateTime departureTime;

    private LocalDateTime expectedReturnTime;

    private String status = "PENDING";

    @Column(unique = true)
    private String barcode;

    private LocalDateTime actualExitTime;

    private LocalDateTime actualReturnTime;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Outpass() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getOutpassType() {
        return outpassType;
    }

    public void setOutpassType(String outpassType) {
        this.outpassType = outpassType;
    }

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getDepartureTime() {
        return departureTime;
    }

    public void setDepartureTime(LocalDateTime departureTime) {
        this.departureTime = departureTime;
    }

    public LocalDateTime getExpectedReturnTime() {
        return expectedReturnTime;
    }

    public void setExpectedReturnTime(LocalDateTime expectedReturnTime) {
        this.expectedReturnTime = expectedReturnTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBarcode() {
        return barcode;
    }

    public void setBarcode(String barcode) {
        this.barcode = barcode;
    }

    public LocalDateTime getActualExitTime() {
        return actualExitTime;
    }

    public void setActualExitTime(LocalDateTime actualExitTime) {
        this.actualExitTime = actualExitTime;
    }

    public LocalDateTime getActualReturnTime() {
        return actualReturnTime;
    }

    public void setActualReturnTime(LocalDateTime actualReturnTime) {
        this.actualReturnTime = actualReturnTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
