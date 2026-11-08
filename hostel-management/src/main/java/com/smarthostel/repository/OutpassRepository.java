
package com.smarthostel.repository;

import com.smarthostel.entity.Outpass;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OutpassRepository extends JpaRepository<Outpass, Long> {

    // Find all outpass requests submitted by a student
    List<Outpass> findByStudentId(Long studentId);

    // Find outpass requests by their approval status
    List<Outpass> findByStatus(String status);

    // Find a particular outpass using its barcode
    Optional<Outpass> findByBarcode(String barcode);

}