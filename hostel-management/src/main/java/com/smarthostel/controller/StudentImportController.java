package com.smarthostel.controller;

import com.smarthostel.entity.Student;
import com.smarthostel.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/students/import")
public class StudentImportController {

    private final StudentRepository studentRepository;

    public StudentImportController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @PostMapping("/csv")
    public ResponseEntity<String> importStudentsFromCsv(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("Please upload a CSV file.");
        }

        try {
            BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            file.getInputStream(),
                            StandardCharsets.UTF_8));

            String line;
            boolean firstLine = true;
            List<Student> students = new ArrayList<>();

            while ((line = reader.readLine()) != null) {

                if (firstLine) {
                    firstLine = false;
                    continue;
                }

                if (line.trim().isEmpty()) {
                    continue;
                }

                String[] data = line.split(",", -1);

                if (data.length < 6) {
                    continue;
                }

                Student student = new Student();

                student.setName(data[0].trim());
                student.setEmail(data[1].trim());
                student.setPhone(data[2].trim());
                student.setDepartment(data[3].trim());
                student.setYear(data[4].trim());
                student.setRoomNumber(data[5].trim());

                students.add(student);
            }

            studentRepository.saveAll(students);

            return ResponseEntity.ok(
                    students.size() + " students imported successfully.");

        } catch (Exception e) {

            return ResponseEntity.badRequest()
                    .body("Error while importing CSV: " + e.getMessage());
        }
    }
}