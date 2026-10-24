package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.IssuanceDTO;
import com.equipment.Management.System.demo.service.IssuanceService;
import com.equipment.Management.System.demo.dto.ReturnRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.security.core.Authentication;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class IssuanceControllerTest {

    private MockMvc mockMvc;

    @Mock private IssuanceService issuanceService;
    @Mock private Authentication authentication;
    @InjectMocks private IssuanceController issuanceController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(issuanceController).build();
    }

    @Test
    @DisplayName("TC_BORROW_17: Create issuance")
    void createIssuance_shouldReturn201() throws Exception {
        when(authentication.getName()).thenReturn("admin");
        when(issuanceService.createIssuance(any(), any())).thenReturn(new IssuanceDTO());

        mockMvc.perform(post("/api/issuances")
                .contentType(MediaType.APPLICATION_JSON)
                .principal(authentication)
                .content("{\"borrowRequestId\":1,\"issueDate\":\"2026-10-24\",\"returnDueDate\":\"2026-10-25\",\"status\":\"ISSUED\",\"equipmentId\":1,\"qtyIssued\":1,\"conditionAtIssue\":\"Working\"}"))
               .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("TC_BORROW_18: Create with invalid data")
    void createIssuance_serviceFails_shouldReturn400() throws Exception {
        when(authentication.getName()).thenReturn("admin");
        when(issuanceService.createIssuance(any(), any())).thenThrow(new RuntimeException("Invalid"));

        mockMvc.perform(post("/api/issuances")
                .contentType(MediaType.APPLICATION_JSON)
                .principal(authentication)
                .content("{}"))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC_BORROW_19: List all issuances")
    void getAll_shouldReturn200() throws Exception {
        when(issuanceService.getAllIssuances()).thenReturn(List.of(new IssuanceDTO()));

        mockMvc.perform(get("/api/issuances"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("TC_BORROW_21: Get by ID not found")
    void getById_notFound_shouldReturn404() throws Exception {
        when(issuanceService.getIssuanceById(9999L)).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/api/issuances/9999"))
               .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("TC_BORROW_23: Filter by status")
    void getByStatus_shouldReturn200() throws Exception {
        when(issuanceService.getIssuancesByStatus("ISSUED")).thenReturn(List.of());

        mockMvc.perform(get("/api/issuances/status/ISSUED"))
               .andExpect(status().isOk());
    }

    @Test
    @DisplayName("TC_BORROW_26: Update non-existent issuance")
    void update_notFound_shouldReturn400() throws Exception {
        when(issuanceService.updateIssuance(anyLong(), any())).thenThrow(new RuntimeException());

        mockMvc.perform(put("/api/issuances/9999")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
               .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("TC_BORROW_27: Delete issuance")
    void delete_shouldReturn200() throws Exception {
        mockMvc.perform(delete("/api/issuances/1"))
               .andExpect(status().isOk())
               .andExpect(content().string("Issuance deleted successfully"));
    }

    @Test
    @DisplayName("TC_BORROW_28: Delete non-existent issuance")
    void delete_failure_shouldReturn500() throws Exception {
        doThrow(new RuntimeException()).when(issuanceService).deleteIssuance(9999L);

        mockMvc.perform(delete("/api/issuances/9999"))
               .andExpect(status().isInternalServerError())
               .andExpect(content().string("Error deleting issuance"));
    }

    @Test
    @DisplayName("TC_BORROW_29: Return issuance")
    void returnIssuance_shouldReturn200() throws Exception {
        when(issuanceService.returnIssuance(anyLong(), any(ReturnRequest.class)))
                .thenReturn(new IssuanceDTO());

        mockMvc.perform(post("/api/issuances/1/return")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"returnDate\":\"2026-10-24\",\"conditionOnReturn\":\"Working\"}"))
                .andExpect(status().isOk());
    }
}