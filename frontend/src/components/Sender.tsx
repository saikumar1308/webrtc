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

        pc.onnegotiationneeded = async () => {
            console.log('Negotiation needed event');
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            socket?.send(JSON.stringify({ type: 'offer', sdp: pc.localDescription }));
        }

        pc.onicecandidate = (event) => {
            console.log('ICE candidate event:', event);
            if (event.candidate) {
                socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
            }
        }


        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'answer') {
                pc.setRemoteDescription(message.sdp);
            } else if (message.type === 'iceCandidate') {
                pc.addIceCandidate(message.candidate);
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