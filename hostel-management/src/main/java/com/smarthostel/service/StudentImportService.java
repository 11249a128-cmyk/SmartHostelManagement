package com.smarthostel.service;

import com.smarthostel.entity.Student;
import com.smarthostel.repository.StudentRepository;
import org.springframework.stereotype.Service;

@Service
public class StudentImportService {

    private final StudentRepository studentRepository;

    public StudentImportService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }
}