"use client";

import { socket } from "../chat-2/socket";

export default function ChatParameters({ color, setColor, avatar, setAvatar }) {
  function connect() {
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  return (
    <div className="flex flex-col items-end p-4 space-y-4">
      <div className="flex space-x-2">
        <button
          onClick={connect}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
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

      <div className="text-sm font-semibold">Change Chat Color</div>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="border p-1 rounded"
        style={{ backgroundColor: color }}
      />

      <div className="text-sm font-semibold">Change Avatar URL</div>
      <a
        href="https://vinicius73.github.io/gravatar-url-generator/#/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline text-xs"
      >
        Link to generate an avatar URL (Gravatar)
      </a>
      <input
        type="text"
        value={avatar}
        onChange={(e) => setAvatar(e.target.value)}
        className="border p-2 rounded w-64"
        placeholder="Enter avatar URL"
      />
    </div>
  );
}
