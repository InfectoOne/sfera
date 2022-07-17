export default interface SferaMessage {
  type: "peer-list" | "peer-joined" | "chat-message" | "nickname" | "rtc-offer" | "rtc-answer" | "ice-candidate"
  peerList?: {
    nickname: string
    ipAddress: string
  }[]
  data?: string | RTCSessionDescription | RTCIceCandidate
  metadata?: {
    name: string,
    type: string
  }
  sender?: string
  receiver?: string | null
}