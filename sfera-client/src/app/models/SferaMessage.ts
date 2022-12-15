export default interface SferaMessage {
    type: "peer-list" | "peer-joined" | "peer-left" | "chat-message" | "nickname" | "rtc-offer" | "rtc-answer" | "ice-candidate"
    peerList?: {
        nickname: string
        ipAddress: string
    }[]
    data?: string | RTCSessionDescription | RTCIceCandidate | null
    metadata?: {
        name: string
        type: string
        size: number
    }
    sender?: string
    receiver?: string | null
}