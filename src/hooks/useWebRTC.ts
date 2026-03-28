/**
 * useWebRTC
 * Encapsulates all WebRTC peer connection logic:
 *  - getUserMedia for local stream
 *  - RTCPeerConnection lifecycle (offer → answer → ICE)
 *  - Attaches remote stream to a video element ref
 */

import { useRef, useCallback, useEffect } from 'react';
import { Socket } from 'socket.io-client';

// ICE servers: Google's public STUN + optional TURN for production
const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface UseWebRTCReturn {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  localStreamRef: React.MutableRefObject<MediaStream | null>;
  startLocalStream: () => Promise<void>;
  stopLocalStream: () => void;
  createOffer: (socket: Socket, targetId: string) => Promise<void>;
  handleOffer: (socket: Socket, offer: RTCSessionDescriptionInit, from: string) => Promise<void>;
  handleAnswer: (answer: RTCSessionDescriptionInit) => Promise<void>;
  handleIceCandidate: (candidate: RTCIceCandidateInit) => Promise<void>;
  closePeerConnection: () => void;
  toggleAudio: (enabled: boolean) => void;
  toggleVideo: (enabled: boolean) => void;
}

export function useWebRTC(): UseWebRTCReturn {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      closePeerConnection();
      stopLocalStream();
    };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  /** Creates a fresh RTCPeerConnection and wires up standard handlers. */
  const createPeerConnection = useCallback((socket: Socket, targetId: string): RTCPeerConnection => {
    // Close any existing connection first
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Send ICE candidates to signalling server as they are gathered
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice_candidate', {
          candidate: event.candidate.toJSON(),
          to: targetId,
        });
      }
    };

    // Attach incoming remote track to the remote video element
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] Connection state:', pc.connectionState);
    };

    pc.onicegatheringstatechange = () => {
      console.log('[WebRTC] ICE gathering state:', pc.iceGatheringState);
    };

    // Add existing local tracks to the peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    return pc;
  }, []);

  // ── Public API ────────────────────────────────────────────────────────────

  /** Request camera + microphone access and show in local video element. */
  const startLocalStream = useCallback(async (): Promise<void> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('[WebRTC] getUserMedia failed:', err);
      throw err;
    }
  }, []);

  /** Stop all local media tracks and clear video elements. */
  const stopLocalStream = useCallback((): void => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  /** Initiator side: create offer and send to signalling server. */
  const createOffer = useCallback(async (socket: Socket, targetId: string): Promise<void> => {
    const pc = createPeerConnection(socket, targetId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('webrtc_offer', { offer, to: targetId });
  }, [createPeerConnection]);

  /** Receiver side: consume incoming offer, send back an answer. */
  const handleOffer = useCallback(
    async (socket: Socket, offer: RTCSessionDescriptionInit, from: string): Promise<void> => {
      const pc = createPeerConnection(socket, from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('webrtc_answer', { answer, to: from });
    },
    [createPeerConnection],
  );

  /** Initiator side: receive and apply the answer from the remote peer. */
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit): Promise<void> => {
    await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
  }, []);

  /** Add a received ICE candidate to the peer connection. */
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit): Promise<void> => {
    try {
      await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('[WebRTC] addIceCandidate error:', err);
    }
  }, []);

  /** Cleanly close the peer connection and clear remote video. */
  const closePeerConnection = useCallback((): void => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, []);

  /** Mute / unmute the audio track without stopping the stream. */
  const toggleAudio = useCallback((enabled: boolean): void => {
    localStreamRef.current?.getAudioTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }, []);

  /** Enable / disable the video track without stopping the stream. */
  const toggleVideo = useCallback((enabled: boolean): void => {
    localStreamRef.current?.getVideoTracks().forEach((t) => {
      t.enabled = enabled;
    });
  }, []);

  return {
    localVideoRef,
    remoteVideoRef,
    localStreamRef,
    startLocalStream,
    stopLocalStream,
    createOffer,
    handleOffer,
    handleAnswer,
    handleIceCandidate,
    closePeerConnection,
    toggleAudio,
    toggleVideo,
  };
}
