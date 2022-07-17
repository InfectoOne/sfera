import SferaMessage from "src/models/SferaMessage"
import SferaPeer from "src/models/SferaPeer"
import { readonly, Ref, ref, toRefs } from "vue"

const serverIp: Ref<string | null> = ref(null)
const serverPort: Ref<number | null> = ref(null)

export const LOCALSTORAGE_SERVERIP_KEY = "server_address"
export const LOCALSTORAGE_SERVERPORT_KEY = "server_port"

const nickname = ref("")
const peersOnline: Ref<SferaPeer[]> = ref([])
const chatMessageList: Ref<string[]> = ref([])
const isConnected = ref(false)
const wsConnection: Ref<WebSocket | null>  = ref(null)

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
      }
    }
  })
}

export default function useSferaConnection () {

  return {
    connect,
    ...toRefs(readonly({
      isConnected,
      nickname,
      peersOnline,
      serverIp,
      serverPort,
      wsConnection
    }))
  }
}
