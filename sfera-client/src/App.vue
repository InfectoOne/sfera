<template>
  <h2>Sfera</h2>
  <div>
  {{ isConnected ? 'Connected' : 'Not connected'}}
  </div>
  <div>
  <h3>Peers online:</h3>
  <div v-for="peer in peersOnline" :key="peer.nickname">
    {{peer.nickname}}
    <input type="file" @change="onFileinputEvent($event)"/>
  </div>
  </div>
  Broadcast message:
  <input v-model="message"/>
  <button @click="broadcastMessage()">Send</button>
  <div style="font-weight: bold; margin: 20px 0 10px 0">
    Received Messages:
  </div>
  <div v-for="(chatMsg, idx) in chatMessageList" :key="idx">
    {{chatMsg}}
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue"
import SferaPeer from "src/models/SferaPeer"
import SferaMessage from "./models/SferaMessage"

const isConnected = ref(false)
const serverIp = "localhost"
const serverPort = "4000"
const peersOnline: Ref<SferaPeer[]> = ref([])

const wsConnection = new WebSocket(`ws://${serverIp}:${serverPort}`)
wsConnection.onopen = () => {
  isConnected.value = true
}

const message = ref("")
const broadcastMessage = () => {
  const chatMsg: SferaMessage = {
    type: "chat-message",
    text: message.value
  }
  wsConnection.send(JSON.stringify(chatMsg))
  message.value = ""
}
const chatMessageList: Ref<string[]> = ref([])
wsConnection.onmessage = (ev: MessageEvent) => {
  console.log(ev.data)
  if (ev.data instanceof Blob) {
    const link = window.document.createElement("a")
    link.href = window.URL.createObjectURL(ev.data as Blob)
    link.download = link.href.split("/").pop() + "." + "jpg"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  } else {
    const sferaMsg = JSON.parse(ev.data) as SferaMessage
    switch (sferaMsg.type) {
    case "chat-message":
      if (sferaMsg.text) {
        chatMessageList.value.push(sferaMsg.text)
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
    }
  }
}

const onFileinputEvent = (e: InputEvent) => {
  const file = (e.target as HTMLInputElement).files?.[0] as Blob
  wsConnection.send(file)
}
</script>
