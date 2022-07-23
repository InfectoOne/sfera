import { downloadFromUrl } from "src/fileHelper"
import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { ref } from "vue"
import useSferaConnection from "./useSferaConnection"

const CHUNK_SIZE_KB = 16 * 1024

export default function usePeerConnection(peer: SferaPeer) {
  let peerConnection: RTCPeerConnection | null = null
  const { wsConnection } = useSferaConnection()
  const isSending = ref(false)

  // the Sfera WebSocket Server acts as a signaling server for the RTC file transfer
  // Here, we add another event listener for RTC-relevant messages for the respective peer
  wsConnection.value?.addEventListener("message", (ev) => {
    const sferaMsg = JSON.parse(ev.data) as SferaMessage
    if (sferaMsg.sender != peer.nickname) {
      return
    }
    switch (sferaMsg.type) {
    case "rtc-offer":
      const offer = sferaMsg.data as RTCSessionDescription
      const fileMetadata = sferaMsg.metadata
      if (!fileMetadata) {
        throw Error("Sfera RTC file transfer failed: No file metadata was sent!")
      }
      receiveFile(offer, fileMetadata)
    case "rtc-answer":
      const answer = sferaMsg.data as RTCSessionDescription
      peerConnection?.setRemoteDescription(answer)
    case "ice-candidate":
      const candidate = sferaMsg.data as RTCIceCandidate
      peerConnection?.addIceCandidate(candidate)
    }
  })

  const sendFile = (file: File) => {
    isSending.value = true
    peerConnection = new RTCPeerConnection()

    peerConnection.onnegotiationneeded = async () => {
      try {
        await peerConnection?.setLocalDescription(await peerConnection?.createOffer())
        const sferaMsg: SferaMessage = {
          type: "rtc-offer",
          receiver: peer.nickname as string,
          data: peerConnection?.localDescription,
          metadata: {
            name: file.name,
            type: file.type,
            size: file.size
          }
        }
        wsConnection.value?.send(JSON.stringify(sferaMsg))
      } catch (error) {
        console.error(error)
      }
    }

    peerConnection.onicecandidate = ({candidate}) => {
      const sferaMsg: SferaMessage = {
        type: "ice-candidate",
        receiver: peer.nickname,
        data: candidate
      }
      wsConnection.value?.send(JSON.stringify(sferaMsg))
    }

    const dataChannel = peerConnection.createDataChannel("dataChannel")
    dataChannel.binaryType = "arraybuffer"
    dataChannel.onopen = async () => {
      // once RTC offers, answers and ICE candidates have been exchanged:
      // the data channel will open and ready for file transfer
      let buffer = await file.arrayBuffer()
      while (buffer.byteLength) {
        const chunk = buffer.slice(0, CHUNK_SIZE_KB)
        buffer = buffer.slice(CHUNK_SIZE_KB, buffer.byteLength)
        dataChannel.send(chunk)
      }
      isSending.value = false
    }
  }

  const receiveFile = async (
    offer: RTCSessionDescription,
    metadata: {
      name: string,
      type: string,
      size: number
    }) => {
    peerConnection = new RTCPeerConnection()
    peerConnection.setRemoteDescription(offer)
    await peerConnection.setLocalDescription(await peerConnection.createAnswer())
    const sferaMsg = {
      type: "rtc-answer",
      receiver: peer.nickname,
      data: peerConnection.localDescription
    }
    wsConnection.value?.send(JSON.stringify(sferaMsg))

    peerConnection.onicecandidate = ({candidate}) => {
      const sferaMsg = {
        type: "ice-candidate",
        receiver: peer.nickname,
        data: candidate
      }
      wsConnection.value?.send(JSON.stringify(sferaMsg))
    }

    const dataChannel = peerConnection.createDataChannel("dataChannel")
    dataChannel.binaryType = "arraybuffer"
    peerConnection.addEventListener("datachannel", (e) => {
      // once RTC offers, answers and ICE candidates have been exchanged:
      // the data channel will open and ready for file transfer
      const { channel }  = e
      const buffer: Blob[] = []
      let bytesReceived = 0
      channel.onmessage = (e) => {
        const { data } = e
        const chunk = data as Blob
        buffer.push(chunk)
        bytesReceived += chunk.size
        if (bytesReceived >= metadata.size) {
          const file = new Blob(buffer)
          const url = window.URL.createObjectURL(file)
          downloadFromUrl(url, metadata.name)
          channel.close()
          isSending.value = false
        }
      }
    })
  }


  return {
    sendFile,
    isSending
  }
}

