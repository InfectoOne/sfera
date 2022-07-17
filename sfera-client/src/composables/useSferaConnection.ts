import { Notify } from "quasar"
import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { readonly, Ref, ref, toRefs } from "vue"
import { base64ToFile, fileToBase64, downloadFromUrl } from "src/fileHelper"

const serverIp: Ref<string | null> = ref(null)
const serverPort: Ref<number | null> = ref(null)

export const LOCALSTORAGE_SERVERIP_KEY = "server_address"
export const LOCALSTORAGE_SERVERPORT_KEY = "server_port"

const nickname = ref("")
const peersOnline: Ref<SferaPeer[]> = ref([])
const chatMessageList: Ref<string[]> = ref([])
const isConnected = ref(false)
const wsConnection: Ref<WebSocket | null>  = ref (null)

const connect = async (ip: string, port: number, remember = false) => {
  serverIp.value = ip
  serverPort.value = port
  return new Promise((resolve, reject) => {
    wsConnection.value = new WebSocket(`ws://${serverIp.value}:${serverPort.value}`)
    wsConnection.value.onopen = () => {
      isConnected.value = true
      resolve(true)
      if(remember) {
        localStorage.setItem(LOCALSTORAGE_SERVERIP_KEY, ip)
        localStorage.setItem(LOCALSTORAGE_SERVERPORT_KEY, String(port))
      }
    }
    wsConnection.value.onclose = () => {
      isConnected.value = false
      reject()
    }

    wsConnection.value.onmessage = async (ev: MessageEvent) => {
      const sferaMsg = JSON.parse(ev.data) as SferaMessage
      switch (sferaMsg.type) {
      case "chat-message":
        if (sferaMsg.data) {
          chatMessageList.value.push(sferaMsg.data as string)
        }
        break
      case "peer-list":
        if (sferaMsg.peerList) {
          peersOnline.value = sferaMsg.peerList
        }
        break
      case "peer-joined":
        if (sferaMsg.peerList) {
          peersOnline.value.push(...sferaMsg.peerList)
        }
        break
      case "nickname":
        if (sferaMsg.data) {
          nickname.value = sferaMsg.data as string
        }
        break
      case "rtc-offer":
        const offer = sferaMsg.data as RTCSessionDescription
        rtcReceive(sferaMsg.sender as string, offer)
      case "rtc-answer":
        const answer = sferaMsg.data as RTCSessionDescription
        rtcPeerConn.setRemoteDescription(answer)
      case "ice-candidate":
        const candidate = sferaMsg.data as RTCIceCandidate
        rtcPeerConn.addIceCandidate(candidate)
      case "file":
        if(sferaMsg.data && sferaMsg.metadata) {
          const { name, type } = sferaMsg.metadata
          const base64str = sferaMsg.data as string
          const { url } = await base64ToFile(base64str, name, type)
          downloadFromUrl(url, name)
          const confirmMsg: SferaMessage = {
            type: "confirm-receive",
            data: nickname.value,
            receiver: sferaMsg.sender
          }
          wsConnection.value?.send(JSON.stringify(confirmMsg))
        }
        break
      }
    }
  })
}

const rtcPeerConn = new RTCPeerConnection()

const rtcSend = (peer: SferaPeer /*, file: File */) => {
  rtcPeerConn.onnegotiationneeded = async () => {
    try {
      await rtcPeerConn.setLocalDescription(await rtcPeerConn.createOffer())
      const sferaMsg = {
        type: "rtc-offer",
        receiver: peer.nickname as string,
        data: rtcPeerConn.localDescription
      }
      wsConnection.value?.send(JSON.stringify(sferaMsg))
    } catch (error) {
      console.error(error)
    }
  }

  rtcPeerConn.onicecandidate = ({candidate}) => {
    const sferaMsg = {
      type: "ice-candidate",
      receiver: peer.nickname,
      data: candidate
    }
    wsConnection.value?.send(JSON.stringify(sferaMsg))
  }

  const sendChannel = rtcPeerConn.createDataChannel("sendChannel")
  sendChannel.binaryType = "arraybuffer"
  sendChannel.onopen = async () => {
    console.log("sending channel open")
    //const arraybuffer = await file.arrayBuffer()
    sendChannel.send("test")
  }
}

const rtcReceive = async (peerNickname: string, offer: RTCSessionDescription) => {
  rtcPeerConn.setRemoteDescription(offer)
  await rtcPeerConn.setLocalDescription(await rtcPeerConn.createAnswer())
  const sferaMsg = {
    type: "rtc-answer",
    receiver: peerNickname,
    data: rtcPeerConn.localDescription
  }
  wsConnection.value?.send(JSON.stringify(sferaMsg))

  rtcPeerConn.onicecandidate = ({candidate}) => {
    const sferaMsg = {
      type: "ice-candidate",
      receiver: peerNickname,
      data: candidate
    }
    wsConnection.value?.send(JSON.stringify(sferaMsg))
  }

  const receiveChannel = rtcPeerConn.createDataChannel("sendChannel")
  receiveChannel.binaryType = "arraybuffer"
  rtcPeerConn.addEventListener("datachannel", (e) => {
    const { channel }  = e
    channel.onmessage = (e) => {
      const { data } = e
      console.log(data)
      channel.close()
    }
  })
}

export default function useSferaConnection (peer?: SferaPeer) {
  const isSending = ref(false)

  const sendFile = async (file: File) => {
    const base64File = await fileToBase64(file)
    const sferaMsg: SferaMessage = {
      type: "file",
      receiver: peer?.nickname,
      data: base64File,
      metadata: {
        name: file.name,
        type: file.type
      }
    }

    rtcSend(peer as SferaPeer)
    return
    wsConnection.value?.send(JSON.stringify(sferaMsg))
    isSending.value = true
    const onConfirmReceive = (ev: MessageEvent) => {
      const sferaMsg = JSON.parse(ev.data) as SferaMessage
      if(sferaMsg.type == "confirm-receive" && sferaMsg.sender == peer?.nickname) {
        isSending.value = false
        Notify.create({ message: `File transfer to "${peer?.nickname}" complete!` })
        wsConnection.value?.removeEventListener("message", onConfirmReceive)
      }
    }
    wsConnection.value?.addEventListener("message", onConfirmReceive)
  }

  return {
    connect,
    ...toRefs(readonly({
      isConnected,
      nickname,
      peersOnline,
      isSending,
      serverIp,
      serverPort,
    })),
    ...(peer ? {sendFile} : {})
  }
}
