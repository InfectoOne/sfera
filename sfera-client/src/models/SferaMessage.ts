export default interface SferaMessage {
  type: "peer-list" | "peer-joined" | "chat-message" | "nickname" | "confirm-receive" | "file"
  peerList?: {
    nickname: string
    ipAddress: string
  }[]
  data?: string
  metadata?: {
    name: string
    type: string
  }
  sender?: string
  receiver?: string | null
}
