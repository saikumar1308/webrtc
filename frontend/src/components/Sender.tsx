import { useEffect, useState } from "react";

export function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            console.log('Connected to WebSocket server as Sender');
            socket.send(JSON.stringify({ type: 'sender' }));
        };

        setSocket(socket);
    }, []);

    async function startSendingMsg() {
        if (!socket) {
            console.error('WebSocket is not connected');
            return;
        }

        const pc = new RTCPeerConnection();

        pc.onnegotiationneeded = async () => {
            console.log('Negotiation needed event');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket?.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));
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

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        pc.addTrack(stream.getTracks()[0]);
        const videoElement = document.getElementById('sender-video') as HTMLVideoElement;
        if (videoElement) {
            videoElement.srcObject = stream;
            videoElement.play();
        }
    }

    return (
        <div className="page-shell">
            <div className="page-card">
                <h1 className="page-heading">Sender</h1>
                <p className="page-subtitle">Start your webcam stream and share it with the receiver.</p>
                <button className="action-button" onClick={startSendingMsg}>Send Video</button>
                <div className="video-container">
                    <video id="sender-video" autoPlay playsInline muted></video>
                </div>
            </div>
        </div>
    );
}