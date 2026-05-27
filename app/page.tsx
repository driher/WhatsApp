"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// ======================
// SOCKET URL (SAFE)
// ======================
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "https://birthday-cruz-solving-howto.trycloudflare.com";
// ======================
// FORMAT TIME
// ======================
const formatTime = () =>
  new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

export default function Home() {
  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState("DISCONNECTED");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ======================
  // SOCKET INIT
  // ======================
  useEffect(() => {
    if (socketRef.current) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on("connect", () => setStatus("CONNECTED"));
    socket.on("disconnect", () => setStatus("DISCONNECTED"));

    socket.on("status", (data) => {
      setStatus(data);
    });

    socket.on("message", (data) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        if (exists) return prev;

        return [
          {
            ...data,
            id: data.id || crypto.randomUUID(),
          },
          ...prev,
        ];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  // ======================
  // GROUP CHAT BY JID
  // ======================
  const groupedChats = useMemo(() => {
    return messages.reduce((acc: any, msg: any) => {
      if (!acc[msg.jid]) acc[msg.jid] = [];
      acc[msg.jid].push(msg);
      return acc;
    }, {});
  }, [messages]);

  const activeMessages = activeChat ? groupedChats[activeChat] || [] : [];

  // auto select first chat
  useEffect(() => {
    if (!activeChat && Object.keys(groupedChats).length > 0) {
      setActiveChat(Object.keys(groupedChats)[0]);
    }
  }, [groupedChats]);

  // auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeMessages]);

  // ======================
  // SEND MESSAGE
  // ======================
  const sendMessage = () => {
    if (!input.trim() || !activeChat) return;

    socketRef.current?.emit("send_message", {
      jid: activeChat,
      text: input,
    });

    setInput("");
  };

  return (
    <main className="h-screen flex bg-[#e5ddd5]">

      {/* SIDEBAR */}
      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <div className="p-3 font-bold border-b flex justify-between">
          <div>Chats ({Object.keys(groupedChats).length})</div>

          <div
            className={`text-xs px-2 py-1 rounded-full ${
              status === "CONNECTED"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {status}
          </div>
        </div>

        {Object.keys(groupedChats).map((jid) => {
          const lastMsg = groupedChats[jid][0];

          return (
            <div
              key={jid}
              onClick={() => setActiveChat(jid)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                activeChat === jid ? "bg-gray-100" : ""
              }`}
            >
              <p className="font-bold text-sm">
                {lastMsg.senderName || jid}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {lastMsg.text || "[MEDIA]"}
              </p>
            </div>
          );
        })}
      </div>

      {/* CHAT */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white p-3 shadow">
            <p className="font-bold">
  {activeMessages?.[0]?.groupName ||
   activeMessages?.[0]?.senderName ||
   activeChat ||
   "Pilih Chat"}
</p>

        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeMessages.map((msg: any) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.direction === "in" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[70%] p-2 rounded-lg shadow text-sm ${
                  msg.direction === "in"
                    ? "bg-white"
                    : "bg-green-200"
                }`}
              >
                <p className="text-[11px] text-gray-500">
                  {msg.senderName || "User"}
                </p>

                {msg.type === "image" && msg.mediaUrl && (
                  <img
                    src={msg.mediaUrl}
                    className="rounded mb-2"
                  />
                )}

                {msg.text && <p>{msg.text}</p>}

                <p className="text-[10px] text-gray-400 text-right">
                  {msg.time || formatTime()}
                </p>
              </div>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="p-3 bg-white border-t flex gap-2">
          <input
            className="flex-1 border rounded-full px-4 py-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-green-500 text-white px-5 rounded-full"
          >
            Kirim
          </button>
        </div>

      </div>
    </main>
  );
}