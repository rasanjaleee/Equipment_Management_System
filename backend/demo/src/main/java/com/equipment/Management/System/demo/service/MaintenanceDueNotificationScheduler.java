package com.equipment.Management.System.demo.service;

import com.equipment.Management.System.demo.model.Maintenance;
import com.equipment.Management.System.demo.model.User;
import com.equipment.Management.System.demo.repository.MaintenanceRepository;
import com.equipment.Management.System.demo.repository.UserRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class MaintenanceDueNotificationScheduler {

    private final MaintenanceRepository maintenanceRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public MaintenanceDueNotificationScheduler(
            MaintenanceRepository maintenanceRepository,
            NotificationService notificationService,
            UserRepository userRepository
    ) {
        this.maintenanceRepository = maintenanceRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CHECK MAINTENANCE DUE DATES
    // Runs every day at 8:00 AM
    // =========================================================

    @Scheduled(cron = "0 0 8 * * *")
    public void checkMaintenanceDueDates() {

        LocalDate today = LocalDate.now();

        System.out.println("======================================");
        System.out.println("CHECKING MAINTENANCE DUE DATES");
        System.out.println("Date: " + today);
        System.out.println("======================================");

        // Check BOTH PENDING and IN_PROGRESS
        List<Maintenance> maintenanceList =
                maintenanceRepository.findByStatusInWithEquipment(
                        List.of("PENDING", "IN_PROGRESS")
                );

        System.out.println(
                "Active maintenance records found: "
                        + maintenanceList.size()
        );

        for (Maintenance maintenance : maintenanceList) {

            // No due date → nothing to check
            if (maintenance.getDueDate() == null) {
                continue;
            }

            long daysRemaining =
                    ChronoUnit.DAYS.between(
                            today,
                            maintenance.getDueDate()
                    );

            System.out.println(
                    "Maintenance ID: " + maintenance.getId()
                            + " | Equipment: "
                            + maintenance.getEquipment().getEquipmentName()
                            + " | Status: "
                            + maintenance.getStatus()
                            + " | Due Date: "
                            + maintenance.getDueDate()
                            + " | Days Remaining: "
                            + daysRemaining
            );

            // ================================================
            // DUE SOON
            // ================================================

            if (daysRemaining == 2) {

                sendDueNotification(
                        maintenance,
                        "Maintenance Due Soon",
                        "Maintenance for equipment \""
                                + maintenance.getEquipment().getEquipmentName()
                                + "\" is due in 2 days.",
                        "DUE_SOON",
                        "MEDIUM"
                );
            }

            // ================================================
            // DUE TODAY
            // ================================================

            else if (daysRemaining == 0) {

                sendDueNotification(
                        maintenance,
                        "Maintenance Due Today",
                        "Maintenance for equipment \""
                                + maintenance.getEquipment().getEquipmentName()
                                + "\" is due today.",
                        "DUE_TODAY",
                        "HIGH"
                );
            }

            // ================================================
            // OVERDUE
            // ================================================

            else if (daysRemaining < 0) {

                sendDueNotification(
                        maintenance,
                        "Maintenance Overdue",
                        "Maintenance for equipment \""
                                + maintenance.getEquipment().getEquipmentName()
                                + "\" was due on "
                                + maintenance.getDueDate()
                                + " and is now overdue.",
                        "OVERDUE",
                        "HIGH"
                );
            }
        }
    }

    // =========================================================
    // SEND NOTIFICATION TO ALL MANAGEMENT USERS
    // =========================================================

    private void sendDueNotification(
            Maintenance maintenance,
            String title,
            String message,
            String alertType,
            String priority
    ) {

        String alertKey =
                "MAINTENANCE_"
                        + maintenance.getId()
                        + "_"
                        + alertType;

        List<User> managers =
                getMaintenanceManagers();

        for (User manager : managers) {

            notificationService.createMaintenanceDueNotification(
                    manager.getId(),
                    title,
                    message,
                    maintenance.getId(),
                    alertKey,
                    priority
            );
        }
    }

    // =========================================================
    // GET ADMIN / TECHNICIAN / SUPER_ADMIN
    // =========================================================

    private List<User> getMaintenanceManagers() {

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getRole() != null
                                && (
                                user.getRole()
                                        .equalsIgnoreCase("ADMIN")
                                        ||
                                        user.getRole()
                                                .equalsIgnoreCase("TECHNICIAN")
                                        ||
                                        user.getRole()
                                                .equalsIgnoreCase("SUPER_ADMIN")
                        )
                )
                .collect(Collectors.toList());
    }
}