<template>
  <h2>Sfera</h2>
  <div>
  {{ isConnected ? 'Connected' : 'Not connected'}}
  </div>
  <div>
  <h3>Peers online:</h3>
  <div v-for="peer in peersOnline" :key="peer.nickname">
    {{peer.nickname}}
  </div>
  </div>
  Broadcast message:
  <input v-model="message"/>
  <button @click="broadcastMessage()">Send</button>
  <div style="font-weight: bold; margin: 20px 0 10px 0">
    Received Messages:
  </div>
  <div v-for="(recievedMsg, idx) in receivedMessages" :key="idx">
    {{recievedMsg}}
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from "vue"
import SferaPeer from "src/models/SferaPeer"

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
  wsConnection.send(message.value)
  message.value = ""
}
const receivedMessages: Ref<string[]> = ref([])
wsConnection.onmessage = (ev: MessageEvent) => {
  receivedMessages.value.push(String(ev.data))
}
</script>
