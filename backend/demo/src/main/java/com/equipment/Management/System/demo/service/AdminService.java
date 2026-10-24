package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Admin;
import com.equipment.Management.System.demo.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    @Autowired
    private AdminRepository repo;

    // ✅ ALWAYS GET SAME ADMIN (ID = 1)
    public Admin getProfile() {
        return repo.findById(1L).orElse(null);
    }

    // ✅ ALWAYS UPDATE SAME ADMIN (ID = 1)
    public Admin updateProfile(Admin admin) {
        admin.setId(1L);
        return repo.save(admin);
    }
}