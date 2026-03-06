import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { Video, VideoOff, Mic, MicOff, PhoneOff } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = "http://localhost:5000";

export default function VideoCall() {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const [socketId, setSocketId] = useState("");
    const [remoteSocketId, setRemoteSocketId] = useState("");
    const [stream, setStream] = useState(null);
    const [calling, setCalling] = useState(false);
    const [connected, setConnected] = useState(false);
    const [videoOn, setVideoOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const myVideo = useRef();
    const remoteVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();

    useEffect(() => {
        // Get local stream
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(s => {
                setStream(s);
                if (myVideo.current) myVideo.current.srcObject = s;
            })
            .catch(() => alert("Camera/Mic access denied. Please allow in browser settings."));

        socketRef.current = io(SOCKET_URL);
        socketRef.current.on("connect", () => setSocketId(socketRef.current.id));
        socketRef.current.emit("joinRoom", { room: appointmentId });

        socketRef.current.on("incomingCall", ({ signal, from, name }) => {
            answerCall(signal, from);
        });

        socketRef.current.on("callAccepted", (signal) => {
            peerRef.current?.signal(signal);
            setConnected(true);
        });

        socketRef.current.on("callEnded", () => endCall());

        return () => {
            stream?.getTracks().forEach(t => t.stop());
            socketRef.current?.disconnect();
        };
    }, [appointmentId]);

    function initiateCall() {
        if (!remoteSocketId) return alert("Enter partner's Socket ID");
        import("simple-peer").then(({ default: Peer }) => {
            peerRef.current = new Peer({ initiator: true, trickle: false, stream });
            peerRef.current.on("signal", signal => {
                socketRef.current.emit("callUser", { to: remoteSocketId, signal, from: socketRef.current.id, name: user.name });
                setCalling(true);
            });
            peerRef.current.on("stream", remoteStream => {
                if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
                setConnected(true);
            });
        });
    }

    function answerCall(signal, from) {
        import("simple-peer").then(({ default: Peer }) => {
            peerRef.current = new Peer({ initiator: false, trickle: false, stream });
            peerRef.current.signal(signal);
            peerRef.current.on("signal", answer => {
                socketRef.current.emit("answerCall", { to: from, signal: answer });
            });
            peerRef.current.on("stream", remoteStream => {
                if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
                setConnected(true);
            });
        });
    }

    function endCall() {
        socketRef.current.emit("endCall", { to: remoteSocketId });
        peerRef.current?.destroy();
        setConnected(false);
        setCalling(false);
        stream?.getTracks().forEach(t => t.stop());
        setStream(null);
    }

    function toggleVideo() {
        stream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
        setVideoOn(v => !v);
    }

    function toggleMic() {
        stream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
        setMicOn(m => !m);
    }

    return (
        <div className="page">
            <Sidebar />
            <main className="content">
                <div className="ph">
                    <div className="row gap12">
                        <Video size={22} color="var(--teal)" />
                        <div>
                            <h1>Video Consultation</h1>
                            <p className="muted">Appointment #{appointmentId?.slice(-6)}</p>
                        </div>
                    </div>
                </div>

                {/* Video grid */}
                <div className="cols2 mb20" style={{ gap: 16 }}>
                    <div className="card" style={{ padding: 0, overflow: "hidden", aspectRatio: "16/9", position: "relative", background: "#000" }}>
                        <video ref={myVideo} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: 8, left: 10, background: "rgba(0,0,0,0.6)", padding: "2px 10px", borderRadius: 20, fontSize: "0.7rem", color: "#fff" }}>
                            You
                        </div>
                    </div>
                    <div className="card" style={{ padding: 0, overflow: "hidden", aspectRatio: "16/9", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {connected ? (
                            <video ref={remoteVideo} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <p className="muted" style={{ fontSize: "0.85rem" }}>Waiting for other participant...</p>
                        )}
                    </div>
                </div>

                {/* Controls */}
                <div className="card mb20">
                    <div className="row gap10 mb16">
                        <button className={`btn ${micOn ? "btn-outline" : "btn-green"}`} onClick={toggleMic}>
                            {micOn ? <Mic size={15} /> : <MicOff size={15} />} {micOn ? "Mute" : "Unmute"}
                        </button>
                        <button className={`btn ${videoOn ? "btn-outline" : "btn-green"}`} onClick={toggleVideo}>
                            {videoOn ? <Video size={15} /> : <VideoOff size={15} />} {videoOn ? "Stop Video" : "Start Video"}
                        </button>
                        {connected && (
                            <button className="btn" style={{ background: "var(--red)", color: "white", marginLeft: "auto" }} onClick={endCall}>
                                <PhoneOff size={15} /> End Call
                            </button>
                        )}
                    </div>

                    {/* Socket ID sharing */}
                    {!connected && (
                        <div>
                            <div className="field mb10">
                                <label className="label">Your Socket ID (share this with the other person)</label>
                                <div className="row gap10">
                                    <input className="input" readOnly value={socketId} style={{ fontFamily: "monospace", fontSize: "0.8rem" }} />
                                    <button className="btn btn-outline sm" onClick={() => { navigator.clipboard.writeText(socketId); }}>Copy</button>
                                </div>
                            </div>
                            <div className="field mb12">
                                <label className="label">Partner's Socket ID</label>
                                <input className="input" placeholder="Paste partner's Socket ID here" value={remoteSocketId} onChange={e => setRemoteSocketId(e.target.value)} />
                            </div>
                            <button className="btn btn-green" onClick={initiateCall} disabled={calling || !remoteSocketId}>
                                <Video size={14} /> {calling ? "Calling..." : "Start Call"}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
