import { useEffect } from "react";
import SockJS from "sockjs-client/dist/sockjs.min.js";
import { Client } from "@stomp/stompjs";

const useNotificationSocket = (userId, onMessage) => {
  useEffect(() => {
    if (!userId) {
      console.log("No user ID. WebSocket not started.");
      return;
    }

    console.log("Starting WebSocket connection for user:", userId);

    const client = new Client({
      webSocketFactory: () => {
        console.log("Creating SockJS socket...");
        return new SockJS("http://localhost:8080/ws");
      },

      reconnectDelay: 5000,

      onConnect: () => {
        console.log("WebSocket connected");

        const topic = `/topic/notifications/${userId}`;

        console.log("Subscribing to:", topic);

        client.subscribe(topic, (message) => {
          console.log("Message received:", message.body);

          try {
            const data = JSON.parse(message.body);
            onMessage(data);
          } catch (error) {
            console.error("Invalid notification message:", error);
          }
        });
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
      },

      onDisconnect: () => {
        console.log("WebSocket disconnected");
      }
    });

    client.activate();

    return () => {
      console.log("Cleaning up WebSocket...");
      client.deactivate();
    };
  }, [userId, onMessage]);
};

export default useNotificationSocket;