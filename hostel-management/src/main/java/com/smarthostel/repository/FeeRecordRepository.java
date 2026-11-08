
package com.smarthostel.repository;

import com.smarthostel.entity.FeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FeeRecordRepository
        extends JpaRepository<FeeRecord, Long> {

    List<FeeRecord> findByStudent_IdOrderByCreatedAtDesc(Long studentId);
}
