package com.smarthostel.repository;

import com.smarthostel.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepository extends JpaRepository<Student, Long> {

    List<Student> findByNameContainingIgnoreCase(String name);
    java.util.Optional<Student> findByEmailIgnoreCase(String email);
}