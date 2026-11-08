package com.smarthostel.repository;

import com.smarthostel.entity.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository
        extends JpaRepository<Complaint, Long> {

    List<Complaint> findByStudentId(Long studentId);

    List<Complaint> findByStatus(String status);
}
