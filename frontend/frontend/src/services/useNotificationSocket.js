import { useEffect } from "react";
import SockJS from "sockjs-client/dist/sockjs.min.js";
import { Client } from "@stomp/stompjs";

const useNotificationSocket = (onMessage) => {
  useEffect(() => {
    console.log("Starting WebSocket connection...");

    const client = new Client({
      webSocketFactory: () => {
        console.log("Creating SockJS socket...");
        return new SockJS("http://localhost:8080/ws");
      },
      reconnectDelay: 5000,

      onConnect: () => {
        console.log("WebSocket connected");

        client.subscribe("/topic/notifications", (message) => {
          console.log("Message received:", message.body);
          const data = JSON.parse(message.body);
          onMessage(data);
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
  }, [onMessage]);
};

export default useNotificationSocket;