package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.model.Laboratory;
import com.equipment.Management.System.demo.service.LaboratoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lab")
@CrossOrigin(origins = "http://localhost:3000")
public class LaboratoryController {

    @Autowired
    private LaboratoryService service;

    // GET ALL
    @GetMapping
    public List<Laboratory> getAllLabs() {
        return service.getAllLabs();
    }

    // ADD
    @PostMapping
    public Laboratory addLab(@RequestBody Laboratory lab) {
        return service.addLab(lab);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Laboratory getLabById(@PathVariable Long id) {
        return service.getLabById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Laboratory updateLab(@PathVariable Long id, @RequestBody Laboratory lab) {
        return service.updateLab(id, lab);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteLab(@PathVariable Long id) {
        service.deleteLab(id);
        return "Lab deleted successfully";
    }
}