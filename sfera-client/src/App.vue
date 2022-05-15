<template>
  <div class="column justify-center items-center">
    <div
      v-if="isConnected"
      class="text-green row items-center"
    >
      <span>Connected to {{ serverIp }}:{{ serverPort }} </span>
      <q-icon name="mdi-check-circle" />
    </div>
    <div class="row q-px-lg" style="width: 85%">
      <!-- invisible file-input element that can be accessed by clicking on the project image (or the placeholder) -->
      <input
        ref="fileInput"
        class="hidden-file-input"
        type="file"
        @change="afterPickFile()"
      >
      <div
        v-for="peer in peersOnline"
        :key="peer.nickname"
        class="col-6"
      >
        <q-card class="q-pa-sm q-ma-xs bg-primary" @click="pickFileForPeer(peer)">
          <q-icon
            name="mdi-monitor"
            size="20px"
            class="bg-negative q-pa-sm q-mr-sm"
            style="border-radius: 100%;"
          />
          <span class="text-subtitle1">{{ peer.nickname }}</span>
        </q-card>
      </div>
      <!--
      Broadcast message:
      <input v-model="message">
      <button @click="broadcastMessage()">
        Send
      </button>
      <div style="font-weight: bold; margin: 20px 0 10px 0">
        Received Messages:
      </div>
      <div
        v-for="(chatMsg, idx) in chatMessageList"
        :key="idx"
      >
        {{ chatMsg }}
      </div>
          -->
    </div>
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

const fileInput: Ref<HTMLInputElement | null> = ref(null)
const selectedPeer: Ref<SferaPeer | null> = ref(null)
const pickFileForPeer = (peer: SferaPeer) => {
  selectedPeer.value = peer
  if (fileInput.value) {
    fileInput.value.click()
  }
}
const afterPickFile = () => {
  const file = fileInput.value?.files?.[0]
  if( file) {
    wsConnection.send(file)
  }
}


</script>

<style scoped lang="sass">
.hidden-file-input
  display: block
  visibility: hidden
  width: 0
  height: 0
</style>
