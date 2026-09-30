package com.equipment.Management.System.demo.dto;

public class LabEquipmentInventoryDTO {

    private String equipmentName;
    private long total;
    private long available;
    private long issued;
    private long underRepair;
    private long broken;

    public LabEquipmentInventoryDTO(
            String equipmentName,
            long total,
            long available,
            long issued,
            long underRepair,
            long broken) {

        this.equipmentName = equipmentName;
        this.total = total;
        this.available = available;
        this.issued = issued;
        this.underRepair = underRepair;
        this.broken = broken;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public long getTotal() {
        return total;
    }

    public long getAvailable() {
        return available;
    }

    public long getIssued() {
        return issued;
    }

    public long getUnderRepair() {
        return underRepair;
    }

    public long getBroken() {
        return broken;
    }
}