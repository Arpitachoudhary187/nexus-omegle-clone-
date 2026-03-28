// ─── Connection & Chat Types ───────────────────────────────────────────────────

export type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'searching'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'me' | 'stranger';
  timestamp: Date;
}

export interface SocketEvents {
  // Emitted to server
  find_match: () => void;
  skip_user: () => void;
  send_message: (payload: { text: string }) => void;
  webrtc_offer: (payload: { offer: RTCSessionDescriptionInit; to: string }) => void;
  webrtc_answer: (payload: { answer: RTCSessionDescriptionInit; to: string }) => void;
  ice_candidate: (payload: { candidate: RTCIceCandidateInit; to: string }) => void;
  typing: (payload: { isTyping: boolean }) => void;

  // Received from server
  match_found: (payload: { strangerId: string; isInitiator: boolean }) => void;
  receive_message: (payload: { text: string; from: string }) => void;
  webrtc_offer_received: (payload: { offer: RTCSessionDescriptionInit; from: string }) => void;
  webrtc_answer_received: (payload: { answer: RTCSessionDescriptionInit; from: string }) => void;
  ice_candidate_received: (payload: { candidate: RTCIceCandidateInit; from: string }) => void;
  stranger_disconnected: () => void;
  stranger_typing: (payload: { isTyping: boolean }) => void;
  waiting: () => void;
  error: (payload: { message: string }) => void;
}

export interface PeerState {
  connection: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

export interface MediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export interface AppContextValue {
  status: ConnectionStatus;
  messages: ChatMessage[];
  isStrangerTyping: boolean;
  mediaState: MediaState;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  startChat: () => void;
  stopChat: () => void;
  nextStranger: () => void;
  sendMessage: (text: string) => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
}
