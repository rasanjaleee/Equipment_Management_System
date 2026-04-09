package com.equipment.Management.System.demo.repository;

import com.equipment.Management.System.demo.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findAllByOrderByTimestampDesc();
    List<ActivityLog> findByUsernameOrderByTimestampDesc(String username);
}