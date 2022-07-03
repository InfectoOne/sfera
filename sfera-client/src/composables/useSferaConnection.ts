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
          wsConnection.value?.send(JSON.stringify(confirmMsg))
        }
        break
      }
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
    wsConnection.value?.send(JSON.stringify(sferaMsg))
    isSending.value = true

    wsConnection.value?.addEventListener("message", (ev) => {
      const sferaMsg = JSON.parse(ev.data) as SferaMessage
      if(sferaMsg.type == "confirm-receive" && sferaMsg.sender == peer?.nickname) {
        isSending.value = false
        Notify.create({ message: `File transfer to "${peer?.nickname}" complete!` })
      }
    })
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
