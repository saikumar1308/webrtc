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
            if (message.type === 'offer') {
                const pc = new RTCPeerConnection();
                pc.setRemoteDescription(message.sdp);
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket?.send(JSON.stringify({ type: 'answer', sdp: pc.localDescription }));
            }
        }

    }, [])

    return (
        <div>
            <h1>Receiver</h1>
        </div>
    )
}