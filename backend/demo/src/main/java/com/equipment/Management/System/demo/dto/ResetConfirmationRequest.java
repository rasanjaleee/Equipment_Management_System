package com.equipment.Management.System.demo.dto;

import jakarta.validation.constraints.NotBlank;

public class ResetConfirmationRequest {

    @NotBlank(message = "Confirmation phrase is required")
    private String confirmationPhrase;

    public ResetConfirmationRequest() {
    }

    public ResetConfirmationRequest(String confirmationPhrase) {
        this.confirmationPhrase = confirmationPhrase;
    }

    public String getConfirmationPhrase() {
        return confirmationPhrase;
    }

    public void setConfirmationPhrase(String confirmationPhrase) {
        this.confirmationPhrase = confirmationPhrase;
    }
}
