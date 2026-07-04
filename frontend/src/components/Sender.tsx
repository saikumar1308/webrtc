import { useEffect, useRef, useState } from "react";

export function Sender() {
    const socketRef = useRef<WebSocket | null>(null);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('Connected to WebSocket server as Sender');
            socket.send(JSON.stringify({ type: 'sender' }));
        };

        return () => {
            stopSendingVideo(false);
            socket.close();
        };
    }, []);

    function stopSendingVideo(notifyServer = true) {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }

        const videoElement = document.getElementById('sender-video') as HTMLVideoElement | null;
        if (videoElement) {
            videoElement.srcObject = null;
        }

        if (notifyServer && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'stop' }));
        }

        setIsStreaming(false);
    }

    async function startSendingMsg() {
        const socket = socketRef.current;
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            console.error('WebSocket is not connected');
            return;
        }

        stopSendingVideo(false);

        const pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.onnegotiationneeded = async () => {
            console.log('Negotiation needed event');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));
        };

        pc.onicecandidate = (event) => {
            console.log('ICE candidate event:', event);
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
            }
        };

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            streamRef.current = stream;
            pc.addTrack(stream.getTracks()[0]);

            const videoElement = document.getElementById('sender-video') as HTMLVideoElement | null;
            if (videoElement) {
                videoElement.srcObject = stream;
                videoElement.play();
            }

            setIsStreaming(true);
        } catch (error) {
            console.error('Failed to access camera', error);
            stopSendingVideo(false);
        }
    }

    return (
        <div className="page-shell">
            <div className="page-card">
                <h1 className="page-heading">Sender</h1>
                <p className="page-subtitle">Start your webcam stream and share it with the receiver.</p>
                <div className="action-row">
                    <button className="action-button" onClick={startSendingMsg} disabled={isStreaming}>Send Video</button>
                    <button className="action-button" onClick={() => stopSendingVideo()} disabled={!isStreaming}>Stop Video</button>
                </div>
                <div className="video-container">
                    <video id="sender-video" autoPlay playsInline muted></video>
                </div>
            </div>
        </div>
    );
}