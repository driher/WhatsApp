"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

// ======================
// CONFIG
// ======================

const SOCKET_URL =
  "https://valuable-footage-argument-metallica.trycloudflare.com";

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

  // ======================
  // STATES
  // ======================

  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState("DISCONNECTED");
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [input, setInput] = useState("");

  // ======================
  // REFS
  // ======================

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ======================
  // SOCKET CONNECT
  // ======================

  useEffect(() => {

    console.log("🔌 Connecting Socket...");

    socketRef.current = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    // ======================
    // CONNECT
    // ======================

    socketRef.current.on("connect", () => {

      console.log("✅ SOCKET CONNECTED");

      setStatus("CONNECTED");

    });

    // ======================
    // DISCONNECT
    // ======================

    socketRef.current.on("disconnect", () => {

      console.log("❌ SOCKET DISCONNECTED");

      setStatus("DISCONNECTED");

    });

    // ======================
    // STATUS UPDATE
    // ======================

    socketRef.current.on("status", (data: any) => {

      console.log("📡 STATUS:", data);

      setStatus(data);

    });

    // ======================
    // RECEIVE MESSAGE
    // ======================

    socketRef.current.on("new_message", (data: any) => {

      console.log("📩 NEW MESSAGE:", data);

      setMessages((prev) => {

        // ======================
        // ANTI DUPLICATE
        // ======================

        const exists = prev.some(
          (m) =>
            m.id === data.id &&
            m.text === data.text &&
            m.time === data.time
        );

        if (exists) return prev;

        return [
          {
            ...data,
            id:
              data.id ||
              Date.now() + Math.random(),
            direction: data.direction || "in",
          },
          ...prev,
        ];

      });

    });

    // ======================
    // SOCKET ERROR
    // ======================

    socketRef.current.on("connect_error", (err) => {

      console.log("❌ SOCKET ERROR:", err.message);

    });

    // ======================
    // CLEANUP
    // ======================

    return () => {

      console.log("🧹 SOCKET CLEANUP");

      socketRef.current?.disconnect();

    };

  }, []);

  // ======================
  // GROUP CHAT
  // ======================

  const groupedChats = useMemo(() => {

    return messages.reduce((acc: any, msg: any) => {

      if (!acc[msg.jid]) {
        acc[msg.jid] = [];
      }

      acc[msg.jid].push(msg);

      return acc;

    }, {});

  }, [messages]);

  // ======================
  // ACTIVE CHAT
  // ======================

  const activeMessages =
    activeChat
      ? groupedChats[activeChat] || []
      : [];

  // ======================
  // AUTO SELECT CHAT
  // ======================

  useEffect(() => {

    if (
      !activeChat &&
      Object.keys(groupedChats).length > 0
    ) {

      setActiveChat(
        Object.keys(groupedChats)[0]
      );

    }

  }, [groupedChats, activeChat]);

  // ======================
  // AUTO SCROLL
  // ======================

  useEffect(() => {

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [activeMessages]);

  // ======================
  // SEND MESSAGE
  // ======================

  const sendMessage = async () => {

    if (!input.trim()) return;

    if (!activeChat) return;

    const msg = {

      id: Date.now(),

      jid: activeChat,

      text: input,

      senderName: "You",

      direction: "out",

      time: formatTime(),

    };

    // ======================
    // OPTIMISTIC UI
    // ======================

    setMessages((prev) => [msg, ...prev]);

    // ======================
    // SEND SOCKET
    // ======================

    socketRef.current?.emit(
      "send_message",
      msg
    );

    setInput("");

  };

  return (

    <main className="h-screen flex bg-[#e5ddd5]">

      {/* ======================
          SIDEBAR
      ====================== */}

      <div className="w-1/3 bg-white border-r overflow-y-auto">

        <div className="p-3 font-bold border-b flex justify-between items-center">

          <div>
            Chats ({Object.keys(groupedChats).length})
          </div>

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
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 transition ${
                activeChat === jid
                  ? "bg-gray-100"
                  : ""
              }`}
            >

              <p className="font-bold text-sm">

                {lastMsg.groupName ||
                  lastMsg.senderName}

              </p>

              <p className="text-xs text-gray-500 truncate">

                {lastMsg.text || "[MEDIA]"}

              </p>

            </div>

          );

        })}

      </div>

      {/* ======================
          CHAT AREA
      ====================== */}

      <div className="flex-1 flex flex-col">

        {/* ======================
            HEADER
        ====================== */}

        <div className="bg-white p-3 shadow">

          <p className="font-bold">

            {activeChat
              ? groupedChats[activeChat]?.[0]
                  ?.groupName ||
                groupedChats[activeChat]?.[0]
                  ?.senderName
              : "Pilih Chat"}

          </p>

          <p className="text-xs text-gray-500">

            WhatsApp Status: {status}

          </p>

        </div>

        {/* ======================
            CHAT BODY
        ====================== */}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">

          {activeMessages.map((msg: any) => {

            const isIncoming =
              msg.direction === "in";

            return (

              <div
                key={msg.id}
                className={`flex ${
                  isIncoming
                    ? "justify-start"
                    : "justify-end"
                }`}
              >

                <div
                  className={`max-w-[70%] p-2 rounded-lg shadow text-sm ${
                    isIncoming
                      ? "bg-white"
                      : "bg-green-200"
                  }`}
                >

                  {/* SENDER */}

                  {isIncoming &&
                    msg.senderName && (

                      <p className="text-[11px] text-gray-500 font-medium">

                        {msg.senderName}

                      </p>

                    )}

                  {/* TEXT */}

                  {msg.text && (

                    <p className="whitespace-pre-wrap">

                      {msg.text}

                    </p>

                  )}

                  {/* TIME */}

                  <p className="text-[10px] text-gray-400 text-right mt-1">

                    {msg.time}

                  </p>

                </div>

              </div>

            );

          })}

          <div ref={bottomRef} />

        </div>

        {/* ======================
            INPUT BAR
        ====================== */}

        <div className="p-3 bg-white border-t flex gap-2">

          <input
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              sendMessage()
            }
            className="flex-1 border rounded-full px-4 py-2 text-sm outline-none"
            placeholder="Ketik pesan..."
          />

          <button
            onClick={sendMessage}
            className="bg-green-500 hover:bg-green-600 transition text-white px-5 rounded-full"
          >
            Kirim
          </button>

        </div>

      </div>

    </main>

  );

}