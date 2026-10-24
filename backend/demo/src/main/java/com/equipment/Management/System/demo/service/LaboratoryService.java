package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Laboratory;
import com.equipment.Management.System.demo.repository.LaboratoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaboratoryService {

    @Autowired
    private LaboratoryRepository repository;

    public List<Laboratory> getAllLabs() {
        return repository.findAll();
    }

    public Laboratory addLab(Laboratory lab) {
        return repository.save(lab);
    }

    public Laboratory updateLab(Long id, Laboratory labDetails) {
        Laboratory lab = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));

        lab.setName(labDetails.getName());
        lab.setDepartment(labDetails.getDepartment());
        lab.setCategoryDepartment(labDetails.getCategoryDepartment());
        lab.setLocation(labDetails.getLocation());

        lab.setInCharge(labDetails.getInCharge());
        lab.setInChargeDesignation(labDetails.getInChargeDesignation());
        lab.setInChargeEmail(labDetails.getInChargeEmail());
        lab.setInChargeContactNumber(labDetails.getInChargeContactNumber());

        lab.setTechnicalOfficerInCharge(
                labDetails.getTechnicalOfficerInCharge()
        );
        lab.setTechnicalOfficerEmail(
                labDetails.getTechnicalOfficerEmail()
        );
        lab.setTechnicalOfficerContactNumber(
                labDetails.getTechnicalOfficerContactNumber()
        );

        lab.setOperatingHours(labDetails.getOperatingHours());
        lab.setAccessInformation(labDetails.getAccessInformation());

        lab.setTotalEquipment(labDetails.getTotalEquipment());
        lab.setWorkingEquipment(labDetails.getWorkingEquipment());

        return repository.save(lab);
    }

    public void deleteLab(Long id) {
        repository.deleteById(id);
    }

    public Laboratory getLabById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab not found"));
    }
}