import { useEffect, useState } from "react";

export function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    
    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');

        socket.onopen = () => {
            console.log('Connected to WebSocket server as Sender');
            socket.send(JSON.stringify({ type: 'sender' }));
        }

        setSocket(socket);
    }, [])

    async function startSendingMsg() {
        if (!socket) {
            console.error('WebSocket is not connected');
            return;
        }
        const pc = new RTCPeerConnection();
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket?.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                pc.setRemoteDescription(message.sdp);
            }
        }
    }

    return (
        <div>
            <h1>Sender</h1>
            <button onClick={startSendingMsg}>Send Message</button>
        </div>
    )
}