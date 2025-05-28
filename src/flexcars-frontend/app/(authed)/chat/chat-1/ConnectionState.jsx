"use client";

export default function ConnectionState({ isConnected }) {
  return <p className="flex items-start justify-start p-4">State: {"" + isConnected}</p>;
}
