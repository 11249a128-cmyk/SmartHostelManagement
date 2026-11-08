package com.smarthostel.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
public class Visitor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String visitorName;
    private String phone;
    private String studentVisited;
    private String relationship;

    private LocalDate visitDate;
    private LocalTime visitTime;

    public Visitor() {
    }

    public Long getId() {
        return id;
    }
     
    public void setId(Long id) {
    this.id = id;
}

    public String getVisitorName() {
        return visitorName;
    }

    public void setVisitorName(String visitorName) {
        this.visitorName = visitorName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getStudentVisited() {
        return studentVisited;
    }

    public void setStudentVisited(String studentVisited) {
        this.studentVisited = studentVisited;
    }

    public String getRelationship() {
        return relationship;
    }

    public void setRelationship(String relationship) {
        this.relationship = relationship;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public LocalTime getVisitTime() {
        return visitTime;
    }

    public void setVisitTime(LocalTime visitTime) {
        this.visitTime = visitTime;
    }
}
