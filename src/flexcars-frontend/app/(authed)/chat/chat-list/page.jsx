"use client";

import Link from "next/link";
import Image from 'next/image'

const chats = [
  {
    id: "chat/chat-1",
    name: "Alice",
    avatar: "https://gravatar.com/avatar/99385b59329a92c7cc3007222e000326?s=400&d=robohash&r=x",
    lastMessage: "Hey, how are you?",
  },
  {
    id: "chat/chat-2",
    name: "Bob",
    avatar: "https://gravatar.com/avatar/b32b9575a3bafd78d99ccbbe4848b378?s=400&d=robohash&r=x",
    lastMessage: "Let's catch up later!",
  },
  {
    id: "chat/chat-3",
    name: "Charlie",
    avatar: "https://gravatar.com/avatar/99385b59329a92c7cc3007222e000326?s=400&d=robohash&r=x",
    lastMessage: "Did you see the update?",
  },
];

export default function ChatList() {
  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Chats</h1>
      <ul className="space-y-4">
        {chats.map((chat) => (
          <li key={chat.id}>
            <Link
              href={`/${chat.id}`}
              className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition"
            >
              <Image
                src={chat.avatar}
                width={50}
                height={50}
                alt="Picture of the author"
              />
              <div>
                <p className="font-semibold">{chat.name}</p>
                <p className="text-sm text-gray-600">{chat.lastMessage}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
