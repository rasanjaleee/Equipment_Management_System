import React, { useEffect, useState } from "react";
import {
    getNotifications,
    getUnreadCount,
    markAsRead
} from "../services/notificationService";

const NotificationBell = ({ userId }) => {

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res1 = await getNotifications(userId);
            const res2 = await getUnreadCount(userId);

            setNotifications(res1.data);
            setUnreadCount(res2.data);
        } catch (error) {
            console.error("Error loading notifications", error);
        }
    };

    const toggleDropdown = () => {
        setOpen(!open);
    };

    const handleMarkAsRead = async (id) => {
        await markAsRead(id);
        loadData();
    };

    return (
        <div style={{ position: "relative" }}>

            {/* 🔔 Bell Icon */}
            <div onClick={toggleDropdown} style={{ cursor: "pointer", fontSize: "20px" }}>
                🔔

                {unreadCount > 0 && (
                    <span style={{
                        background: "red",
                        color: "white",
                        borderRadius: "50%",
                        padding: "2px 6px",
                        fontSize: "12px",
                        marginLeft: "5px"
                    }}>
                        {unreadCount}
                    </span>
                )}
            </div>

            {/* 📩 Dropdown */}
            {open && (
                <div style={{
                    position: "absolute",
                    right: 0,
                    top: "30px",
                    width: "300px",
                    background: "white",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    maxHeight: "400px",
                    overflowY: "auto",
                    zIndex: 1000
                }}>

                    {notifications.length === 0 ? (
                        <p style={{ padding: "10px" }}>No notifications</p>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleMarkAsRead(n.id)}
                                style={{
                                    padding: "10px",
                                    borderBottom: "1px solid #eee",
                                    cursor: "pointer",
                                    backgroundColor: n.read ? "white" : "#f5f5f5"
                                }}
                            >
                                <b>{n.title}</b>
                                <p style={{ margin: 0, fontSize: "12px" }}>
                                    {n.message}
                                </p>
                            </div>
                        ))
                    )}

                </div>
            )}

        </div>
    );
};

export default NotificationBell;