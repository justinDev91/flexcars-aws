"use client";

import { useState } from "react";
import { socket } from "./socket";

export function Form() {
  const [value, setValue] = useState("");
  const [color, setColor] = useState("#d1e7dd");
  const [avatar, setAvatar] = useState("https://gravatar.com/avatar/99385b59329a92c7cc3007222e000326?s=400&d=robohash&r=x");
  const [isLoading, setIsLoading] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    const timestamp = new Date().toLocaleTimeString();
    socket
      .timeout(5000)
      .emit("message", { sender: "Chat1", text: value, color, avatar, timestamp }, () => {
        setIsLoading(false);
      });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col">
      {isLoading && <p>Loading...</p>}
    
   <div className="flex justify-between items-start">
          <div className="flex-1" />
          <div className="flex flex-col items-end space-y-2">
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
        </div>

      <div className="flex items-center border rounded">
        <input
         type="text"
         onChange={(e) => setValue(e.target.value)}
         className="flex-grow p-2"
         placeholder="Type your message"
          />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
      >
        Submit
      </button>
    </form>
  );
}
