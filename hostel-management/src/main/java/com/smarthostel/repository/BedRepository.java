package com.smarthostel.repository;

import com.smarthostel.entity.Bed;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BedRepository extends JpaRepository<Bed, Long> {

    // Find all beds in a particular room
    List<Bed> findByRoomNumber(String roomNumber);

    // Find the bed assigned to a particular student
    Optional<Bed> findByStudentId(Long studentId);

}