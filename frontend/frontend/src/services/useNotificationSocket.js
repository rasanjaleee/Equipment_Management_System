import { useEffect } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";

const useNotificationSocket = (onMessage) => {
  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);

    stompClient.connect({}, () => {
      stompClient.subscribe("/topic/notifications", (message) => {
        const data = JSON.parse(message.body);
        onMessage(data);
      });
    });

    return () => {
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => {
          console.log("WebSocket disconnected");
        });
      }
    };
  }, [onMessage]);
};

export default useNotificationSocket;