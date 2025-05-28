"use client";

import { useEffect, useState } from "react";
import { ConnectionManager } from "./ConnectionManager";
import ConnectionState from "./ConnectionState";
import Events from "./Events";
import { Form } from "./Form";
import { socket } from "./socket";

export default function Chat() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [fooEvents, setFooEvents] = useState([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onFooEvent(value) {
      console.log(value);

      setFooEvents((previous) => [...previous, value]);
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onFooEvent);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onFooEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between bg-white shadow px-6 py-4">
        <div className="text-xl font-bold text-gray-800">Chat App</div>
        <div className="flex items-center space-x-4">
          <ConnectionState isConnected={isConnected} />
          <ConnectionManager />
        </div>
      </nav>
      <main className="flex flex-col items-center justify-center px-4 py-8 space-y-6">
        <Events events={fooEvents} />
        <Form />
      </main>
    </div>
  );
}
