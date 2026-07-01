import { useEffect } from "react";

export function Receiver() {

    useEffect(() => {
        const socket = new WebSocket('ws://localhost:8080');
        let pc: RTCPeerConnection;

        socket.onopen = () => {
            console.log('Connected to WebSocket server as Receiver');
            socket.send(JSON.stringify({ type: 'receiver' }));
        }

        socket.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            if (message.type === 'offer') {
                pc = new RTCPeerConnection();
                pc.setRemoteDescription(message.sdp);

                pc.onicecandidate = (event) => {
                    console.log('ICE candidate event:', event);
                    if (event.candidate) {
                        socket.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
                    }
                }

                pc.ontrack = (event) => {
                    console.log('Track event:', event);
                    const videoElement = document.getElementById('receiver-video') as HTMLVideoElement;
                    if (videoElement) {
                        videoElement.srcObject = new MediaStream([event.track]);
                        videoElement.play();
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
            <div className="video-container">
                <video id="receiver-video" autoPlay playsInline></video>
            </div>
        </div>
    )
}