package com.smarthostel.repository;

import com.smarthostel.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VisitorRepository extends JpaRepository<Visitor, Long> {
}