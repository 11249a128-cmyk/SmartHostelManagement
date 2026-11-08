package com.smarthostel.controller;

import com.smarthostel.entity.Student;
import com.smarthostel.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // Add a new student
    @PostMapping
    public Student addStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    // Get all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // Get student by ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    // Search students by name
    @GetMapping("/search")
    public List<Student> searchStudents(@RequestParam("name") String name) {
        return studentRepository.findByNameContainingIgnoreCase(name);
    }

    // Update student
    @PutMapping("/{id}")
    public Student updateStudent(
            @PathVariable Long id,
            @RequestBody Student updatedStudent) {

        Student student = studentRepository.findById(id).orElse(null);

        if (student == null) {
            return null;
        }

        student.setName(updatedStudent.getName());
        student.setEmail(updatedStudent.getEmail());
        student.setPhone(updatedStudent.getPhone());
        student.setDepartment(updatedStudent.getDepartment());
        student.setYear(updatedStudent.getYear());
        student.setRoomNumber(updatedStudent.getRoomNumber());

        return studentRepository.save(student);
    }

    // Delete student
    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {

        if (!studentRepository.existsById(id)) {
            return "Student not found";
        }

        studentRepository.deleteById(id);

        return "Student deleted successfully";
    }
}