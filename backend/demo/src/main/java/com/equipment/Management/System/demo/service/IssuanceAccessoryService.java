package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.dto.IssuanceAccessoryReturnRequest;
import com.equipment.Management.System.demo.model.IssuanceAccessory;
import com.equipment.Management.System.demo.repository.IssuanceAccessoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class IssuanceAccessoryService {

    private final IssuanceAccessoryRepository issuanceAccessoryRepository;

    public IssuanceAccessoryService(
            IssuanceAccessoryRepository issuanceAccessoryRepository) {
        this.issuanceAccessoryRepository = issuanceAccessoryRepository;
    }

    public List<IssuanceAccessory> getByIssuanceId(Long issuanceId) {
        return issuanceAccessoryRepository.findByIssuance_Id(issuanceId);
    }

    @Transactional
    public IssuanceAccessory returnAccessory(
            Long id,
            IssuanceAccessoryReturnRequest request) {

        IssuanceAccessory accessory = issuanceAccessoryRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Issuance accessory not found: " + id));

        if (request.getQuantityReturned() == null
                || request.getQuantityReturned() < 0) {
            throw new RuntimeException(
                    "Returned quantity cannot be negative"
            );
        }

        if (request.getQuantityReturned() > accessory.getQuantityIssued()) {
            throw new RuntimeException(
                    "Returned quantity cannot be greater than issued quantity"
            );
        }

        if (request.getReturnStatus() == null
                || request.getReturnStatus().isBlank()) {
            throw new RuntimeException(
                    "Return status is required"
            );
        }

        String status = request.getReturnStatus().toUpperCase();

        if (!status.equals("RETURNED")
                && !status.equals("MISSING")
                && !status.equals("DAMAGED")) {
            throw new RuntimeException(
                    "Return status must be RETURNED, MISSING or DAMAGED"
            );
        }

        accessory.setQuantityReturned(request.getQuantityReturned());
        accessory.setReturnStatus(status);
        accessory.setRemarks(request.getRemarks());

        return issuanceAccessoryRepository.save(accessory);
    }
}