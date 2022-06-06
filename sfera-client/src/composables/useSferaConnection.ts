import { Notify } from "quasar"
import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { Ref, ref } from "vue"

const isConnected = ref(false)
const serverIp = "192.168.0.220"
const serverPort = "4000"
const nickname = ref("")
const peersOnline: Ref<SferaPeer[]> = ref([])
const chatMessageList: Ref<string[]> = ref([])

const wsConnection = new WebSocket(`ws://${serverIp}:${serverPort}`)
wsConnection.onopen = () => {
  isConnected.value = true
}

wsConnection.onmessage = async (ev: MessageEvent) => {
  const sferaMsg = JSON.parse(ev.data) as SferaMessage
  switch (sferaMsg.type) {
  case "chat-message":
    if (sferaMsg.data) {
      chatMessageList.value.push(sferaMsg.data)
    }
    break
  case "peer-list":
    if (sferaMsg.peerList) {
      peersOnline.value = sferaMsg.peerList
    }
    break
  case "peer-joined":
    console.log("aha", sferaMsg)
    if (sferaMsg.peerList) {
      peersOnline.value.push(...sferaMsg.peerList)
    }
    break
  case "nickname":
    if (sferaMsg.data) {
      nickname.value = sferaMsg.data
    }
    break
  case "file":
    if(sferaMsg.data && sferaMsg.metadata) {
      const { name, type } = sferaMsg.metadata
      const base64str = sferaMsg.data
      const { url } = await base64ToFile(base64str, name, type)
      downloadFromUrl(url, name)
      const confirmMsg: SferaMessage = {
        type: "confirm-receive",
        data: nickname.value,
        receiver: sferaMsg.sender
      }
      wsConnection.send(JSON.stringify(confirmMsg))
    }
    break
  }
}

const fileToBase64 = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer()
  let byteStr = ""
  const byteArr = new Uint8Array( arrayBuffer )
  for (let i = 0; i < byteArr.byteLength; i++) {
    byteStr += String.fromCharCode( byteArr[ i ] )
  }
  return btoa(byteStr)
}

const base64ToFile = async (base64str: string, name: string, type: string) => {
  const res = await fetch(`data:${type};base64,${base64str}`)
  const blob = await res.blob()
  const file = new File([blob], name)
  const url = window.URL.createObjectURL(file)
  return {
    file,
    url
  }
}

const downloadFromUrl = (url: string, filename: string) => {
  const link = window.document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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
    wsConnection.send(JSON.stringify(sferaMsg))
    isSending.value = true

    wsConnection.addEventListener("message", (ev) => {
      const sferaMsg = JSON.parse(ev.data) as SferaMessage
      if(sferaMsg.type == "confirm-receive" && sferaMsg.sender == peer?.nickname) {
        isSending.value = false
        Notify.create({ message: `File transfer to "${peer?.nickname}" complete!` })
      }
    })
  }

  return {
    isConnected,
    nickname,
    peersOnline,
    isSending,
    ...(peer ? {sendFile} : {})
  }
}
