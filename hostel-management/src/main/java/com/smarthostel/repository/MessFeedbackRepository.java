
package com.smarthostel.repository;

import com.smarthostel.entity.MessFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessFeedbackRepository
        extends JpaRepository<MessFeedback, Long> {

    List<MessFeedback> findAllByOrderByCreatedAtDesc();

    List<MessFeedback> findByStudent_IdOrderByCreatedAtDesc(Long studentId);
}
