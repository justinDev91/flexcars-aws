"use client";

export default function Events({ events }) {
  return (
    <div className="w-full max-w-3xl h-[70vh] overflow-y-auto px-4 py-6 space-y-4">
      {events.map((event, index) => {
        const isChat1 = event.sender === "Chat1";

        return (
          <div
            key={index}
            className={`flex ${isChat1 ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`rounded-lg p-3 max-w-xs shadow-md ${
                isChat1 ? "bg-blue-100 text-left" : "bg-green-100 text-right"
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                {event.avatar && (
                  <img
                    src={event.avatar}
                    alt="avatar"
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <div className="text-sm font-semibold">{event.sender}</div>
              </div>
              <div className="text-sm">{event.text}</div>
              <div className="text-xs text-gray-500 mt-1">
                {event.timestamp}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
