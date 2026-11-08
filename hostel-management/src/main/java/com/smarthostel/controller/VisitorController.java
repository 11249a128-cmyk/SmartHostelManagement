package com.smarthostel.controller;

import com.smarthostel.entity.Visitor;
import com.smarthostel.repository.VisitorRepository;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/visitors")
@CrossOrigin(
    origins = {
        "http://localhost:5173",
        "http://localhost:5174"
    },
    allowCredentials = "true"
)
public class VisitorController {

    private final VisitorRepository visitorRepository;

    public VisitorController(VisitorRepository visitorRepository) {
        this.visitorRepository = visitorRepository;
    }

    // View all visitor records
    @GetMapping
    public List<Visitor> getAllVisitors() {
        return visitorRepository.findAll();
    }

    // Add a visitor record
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Visitor addVisitor(@RequestBody Visitor visitor) {

        visitor.setId(null);

        if (visitor.getVisitorName() == null
                || visitor.getVisitorName().isBlank()
                || visitor.getPhone() == null
                || visitor.getPhone().isBlank()
                || visitor.getStudentVisited() == null
                || visitor.getStudentVisited().isBlank()
                || visitor.getRelationship() == null
                || visitor.getRelationship().isBlank()
                || visitor.getVisitDate() == null
                || visitor.getVisitTime() == null) {

            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "All visitor details are required"
            );
        }

        return visitorRepository.save(visitor);
    }

    // Delete an incorrect visitor record
    @DeleteMapping("/{id}")
    public void deleteVisitor(@PathVariable Long id) {

        if (!visitorRepository.existsById(id)) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Visitor record not found"
            );
        }

        visitorRepository.deleteById(id);
    }
}