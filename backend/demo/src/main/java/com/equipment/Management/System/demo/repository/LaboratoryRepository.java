package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.Laboratory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LaboratoryRepository extends JpaRepository<Laboratory, Long> {
}