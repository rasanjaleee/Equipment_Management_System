package com.equipment.Management.System.demo.dto;

public class MaintenanceStatusDTO {

    private boolean maintenanceActive;
    private String message;
    private String startTime;
    private String endTime;

    public MaintenanceStatusDTO() {
    }

    public MaintenanceStatusDTO(boolean maintenanceActive, String message, String startTime, String endTime) {
        this.maintenanceActive = maintenanceActive;
        this.message = message;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public boolean isMaintenanceActive() {
        return maintenanceActive;
    }

    public void setMaintenanceActive(boolean maintenanceActive) {
        this.maintenanceActive = maintenanceActive;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }
}
