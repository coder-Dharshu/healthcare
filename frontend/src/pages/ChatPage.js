import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Send, MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

export default function ChatPage() {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const socketRef = useRef(null);
    const bottomRef = useRef(null);

    useEffect(() => {
        axios.get(`/chat/${appointmentId}`).then(r => setMessages(r.data));

        socketRef.current = io(SOCKET_URL);
        socketRef.current.emit("joinRoom", { room: appointmentId });

        socketRef.current.on("newMessage", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        return () => socketRef.current?.disconnect();
    }, [appointmentId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function sendMessage(e) {
        e.preventDefault();
        if (!text.trim()) return;
        socketRef.current.emit("sendMessage", {
            room: appointmentId,
            senderId: user._id,
            senderName: user.name,
            text: text.trim()
        });
        setText("");
    }

    return (
        <div className="page">
            <Sidebar />
            <main className="content" style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
                <div className="ph">
                    <div className="row gap12">
                        <MessageCircle size={22} color="var(--teal)" />
                        <div>
                            <h1>Real-time Chat</h1>
                            <p className="muted">Appointment #{appointmentId?.slice(-6)}</p>
                        </div>
                    </div>
                </div>

                {/* Messages area */}
                <div className="card" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, maxHeight: "calc(100vh - 280px)" }}>
                    {messages.length === 0 && (
                        <div className="empty" style={{ margin: "auto" }}>No messages yet. Start the conversation!</div>
                    )}
                    {messages.map((msg) => {
                        const isMe = (msg.sender?._id || msg.sender) === user._id;
                        return (
                            <div key={msg._id} style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                                <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 3 }}>
                                    {msg.sender?.name || msg.senderName}
                                </div>
                                <div style={{
                                    maxWidth: "70%", padding: "10px 14px", borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                                    background: isMe ? "var(--teal)" : "var(--dark2)",
                                    color: isMe ? "#000" : "var(--white)",
                                    fontSize: "0.9rem"
                                }}>
                                    {msg.text}
                                </div>
                                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 3 }}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input area */}
                <form onSubmit={sendMessage} className="row gap10" style={{ marginTop: 12 }}>
                    <input
                        className="input"
                        style={{ flex: 1 }}
                        placeholder="Type a message..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                    <button className="btn btn-green" type="submit" disabled={!text.trim()}>
                        <Send size={15} /> Send
                    </button>
                </form>
            </main>
        </div>
    );
}
