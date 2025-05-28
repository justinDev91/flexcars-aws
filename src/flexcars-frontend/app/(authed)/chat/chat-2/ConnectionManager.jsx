"use client";

import { socket } from "./socket";

export function ConnectionManager() {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <div className="flex items-start justify-start p-4">
      <button
        onClick={connect}
        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded mr-2"
      >
        Connect
      </button>
      <button
        onClick={disconnect}
        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
      >
        Disconnect
      </button>
    </div>
  );

}
