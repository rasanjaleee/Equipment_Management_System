
package com.equipment.Management.System.demo.controller;

import com.equipment.Management.System.demo.dto.BorrowRequestResponse;
import com.equipment.Management.System.demo.service.BorrowRequestService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class BorrowRequestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BorrowRequestService borrowRequestService;

    @InjectMocks
    private BorrowRequestController borrowRequestController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(borrowRequestController)
                .build();
    }

    @Test
    @DisplayName("TC_BORROW_01: Create borrow request")
    void create_shouldReturn201() throws Exception {

        when(borrowRequestService.createBorrowRequest(
                any(), eq("student@test.com")))
                .thenReturn(new BorrowRequestResponse());

        mockMvc.perform(post("/api/borrow-requests")
                        .principal(() -> "student@test.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isCreated());

        verify(borrowRequestService)
                .createBorrowRequest(any(), eq("student@test.com"));
    }

    @Test
    @DisplayName("TC_BORROW_05: List all requests")
    void getAll_shouldReturn200() throws Exception {

        when(borrowRequestService.getAllBorrowRequests())
                .thenReturn(List.of());

        mockMvc.perform(get("/api/borrow-requests"))
                .andExpect(status().isOk());

        verify(borrowRequestService).getAllBorrowRequests();
    }

    @Test
    @DisplayName("TC_BORROW_06: Pending to Approved")
    void approve_shouldReturn200() throws Exception {

        when(borrowRequestService.updateStatus(1L, "APPROVED"))
                .thenReturn(new BorrowRequestResponse());

        mockMvc.perform(patch("/api/borrow-requests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isOk());

        verify(borrowRequestService)
                .updateStatus(1L, "APPROVED");
    }

    @Test
    @DisplayName("TC_BORROW_07: Pending to Rejected")
    void reject_shouldReturn200() throws Exception {

        when(borrowRequestService.updateStatus(1L, "REJECTED"))
                .thenReturn(new BorrowRequestResponse());

        mockMvc.perform(patch("/api/borrow-requests/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"REJECTED\"}"))
                .andExpect(status().isOk());

        verify(borrowRequestService)
                .updateStatus(1L, "REJECTED");
    }

    @Test
    @DisplayName("TC_BORROW_08: Update nonexistent request")
    void updateStatus_whenRequestNotFound_shouldReturn404()
            throws Exception {

        when(borrowRequestService.updateStatus(9999L, "APPROVED"))
                .thenThrow(new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Borrow request not found"
                ));

        mockMvc.perform(patch("/api/borrow-requests/9999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"APPROVED\"}"))
                .andExpect(status().isNotFound());

        verify(borrowRequestService)
                .updateStatus(9999L, "APPROVED");
    }

   @Test
@DisplayName("TC_BORROW_09: Create request without principal")
void create_withoutPrincipal_shouldNotCallService()
        throws Exception {

    org.junit.jupiter.api.Assertions.assertThrows(
        jakarta.servlet.ServletException.class,
        () -> mockMvc.perform(post("/api/borrow-requests")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
    );

    verifyNoInteractions(borrowRequestService);
}
}
