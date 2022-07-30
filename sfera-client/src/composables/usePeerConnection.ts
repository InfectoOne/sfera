import { downloadFromUrl } from "src/fileHelper"
import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { computed, Ref, ref } from "vue"
import useSferaConnection from "./useSferaConnection"

const CHUNK_SIZE_KB = 16 * 1024

export default function usePeerConnection(peer: SferaPeer) {
  let peerConnection: RTCPeerConnection | null = null
  const { wsConnection } = useSferaConnection()
  const isActive = ref(false)
  const bytesTransferred = ref(0)

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
      console.log("offer")
      if (!fileMetadata) {
        throw Error("Sfera RTC file transfer failed: No file metadata was sent!")
      }
      receiveFile(offer, fileMetadata)
    case "rtc-answer":
      const answer = sferaMsg.data as RTCSessionDescription
      console.log("answer")
      peerConnection?.setRemoteDescription(answer)
    case "ice-candidate":
      const candidate = sferaMsg.data as RTCIceCandidate
      peerConnection?.addIceCandidate(candidate)
    }
  })

  const currentFileSize: Ref<number | null> = ref(null)

  const sendFile = async (file: File) => {
    return new Promise((resolve) => {
      isActive.value = true
      peerConnection = new RTCPeerConnection()
      currentFileSize.value = file.size

      peerConnection.onnegotiationneeded = async () => {
        try {
          console.log("negotiation needed")
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
        console.log("ice candidate needed", candidate)
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
        console.log("channel open")
        // once RTC offers, answers and ICE candidates have been exchanged:
        // the data channel will open and ready for file transfer
        let buffer = await file.arrayBuffer()

        const sendNextChunk = () => {
          const chunk = buffer.slice(0, CHUNK_SIZE_KB)
          buffer = buffer.slice(CHUNK_SIZE_KB, buffer.byteLength)
          dataChannel.send(chunk)
          bytesTransferred.value += chunk.byteLength
          if (bytesTransferred.value < file.size) {
            setTimeout(sendNextChunk, 0)
          } else {
            isActive.value = false
            bytesTransferred.value = 0
            currentFileSize.value = 0
            dataChannel.close()
            resolve(true)
          }
        }

        sendNextChunk()
      }
    })
  }

  const receiveFile = async (
    offer: RTCSessionDescription,
    metadata: {
      name: string,
      type: string,
      size: number
    }) => {
    isActive.value = true
    currentFileSize.value = metadata.size
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
      channel.onmessage = (e) => {
        const { data } = e
        const chunk = data as Blob
        buffer.push(chunk)
        bytesTransferred.value += chunk.size
        if (bytesTransferred.value >= metadata.size) {
          const file = new Blob(buffer)
          const url = window.URL.createObjectURL(file)
          downloadFromUrl(url, metadata.name)
          channel.close()
          isActive.value = false
          bytesTransferred.value = 0
          currentFileSize.value = 0
        }
      }
    })
  }

  const progress = computed(() => currentFileSize.value ? Math.round((bytesTransferred.value / currentFileSize.value) * 100) : 0)



  return {
    sendFile,
    isActive,
    bytesTransferred,
    progress
  }
}

