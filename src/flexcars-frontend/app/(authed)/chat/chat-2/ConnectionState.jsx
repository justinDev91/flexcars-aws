"use client";

export default function ConnectionState({ isConnected }) {
  return <p className="flex items-start justify-self-end p-4">State: {"" + isConnected}</p>;
}
