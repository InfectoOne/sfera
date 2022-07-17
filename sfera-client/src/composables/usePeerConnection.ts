import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { ref } from "vue"
import useSferaConnection from "./useSferaConnection"

export default function usePeerConnection(peer: SferaPeer) {
  let peerConnection: RTCPeerConnection | null = null
  const { wsConnection } = useSferaConnection()
  const isSending = ref(false)

  // the Sfera WebSocket Server acts as a signaling server for the RTC file transfer
  // Here, we add an event listener for RTC-relevant messages only from given peer
  wsConnection.value?.addEventListener("message", (ev) => {
    const sferaMsg = JSON.parse(ev.data) as SferaMessage
    if (sferaMsg.sender != peer.nickname) {
      return
    }
    switch (sferaMsg.type) {
    case "rtc-offer":
      const offer = sferaMsg.data as RTCSessionDescription
      receiveFile(offer)
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
        const sferaMsg = {
          type: "rtc-offer",
          receiver: peer.nickname as string,
          data: peerConnection?.localDescription
        }
        wsConnection.value?.send(JSON.stringify(sferaMsg))
      } catch (error) {
        console.error(error)
      }
    }

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
    dataChannel.onopen = async () => {
      // once RTC offers, answers and ICE candidates have been exchanged:
      // the data channel will open and ready for file transfer
      const arraybuffer = await file.arrayBuffer()
      console.log("🚀 ~ file: useSferaConnection.ts ~ line 106 ~ dataChannel.onopen= ~ arraybuffer", arraybuffer)
      dataChannel.send("test")
      isSending.value = false
    }
  }

  const receiveFile = async (offer: RTCSessionDescription) => {
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
      channel.onmessage = (e) => {
        const { data } = e
        console.log(data)
        channel.close()
      }
    })
  }


  return {
    sendFile,
    isSending
  }
}

