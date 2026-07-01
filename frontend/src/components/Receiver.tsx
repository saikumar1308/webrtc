import { useEffect } from "react";

export function Receiver() {

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        socket.onopen = () => {
            console.log('Connected to WebSocket server as Receiver');
            socket.send(JSON.stringify({ type: 'receiver' }));
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            const pc = new RTCPeerConnection();
            if (message.type === 'offer') {
                pc.setRemoteDescription(message.sdp);

                pc.onicecandidate = (event) => {
                    console.log('ICE candidate event:', event);
                    if (event.candidate) {
                        socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
                    }
                }
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket?.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription }));
            } else if (message.type === 'iceCandidate') {
                await pc.addIceCandidate(message.candidate);
            }
        }

    }, [])

    return (
        <div>
            <h1>Receiver</h1>
        </div>
    )
}