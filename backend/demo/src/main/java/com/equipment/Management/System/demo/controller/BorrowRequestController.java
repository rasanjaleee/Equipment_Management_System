package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.BorrowRequestCreateRequest;
import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.service.BorrowRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow-requests")
public class BorrowRequestController {

    private final BorrowRequestService borrowRequestService;

    public BorrowRequestController(BorrowRequestService borrowRequestService) {
        this.borrowRequestService = borrowRequestService;
    }

    @GetMapping
    public ResponseEntity<List<BorrowRequestResponse>> getAllRequests() {
        return ResponseEntity.ok(borrowRequestService.getAllBorrowRequests());
    }

    @PostMapping
    public ResponseEntity<BorrowRequestResponse> createBorrowRequest(@RequestBody BorrowRequestCreateRequest request) {
        BorrowRequestResponse created = borrowRequestService.createBorrowRequest(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<BorrowRequestResponse> updateStatus(@PathVariable Long id,
                                                              @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        BorrowRequestResponse updated = borrowRequestService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
