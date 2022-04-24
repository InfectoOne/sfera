export default interface SferaMessage {
  type: "peer-list" | "peer-joined" | "chat-message"
  peerList?: {
    nickname: string
    ipAddress: string
  }[]
  text?: string
}
