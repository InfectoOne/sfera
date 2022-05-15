<template>
  <div
    class="column"
    style="height: 100vh"
  >
    <q-toolbar color="primary">
      <q-toolbar-title class="text-primary text-weight-bold">
        Sfera
      </q-toolbar-title>
      <div class="row items-center text-caption">
        <q-icon
          name="mdi-account"
          size="12px"
          class="bg-secondary q-pa-xs"
          style="border-radius: 100%;"
        />
        <span class="q-ml-sm">{{ nickname }}</span>
      </div>
    </q-toolbar>

    <q-separator />
    <div class="column peers-container justify-center items-center">
      <div class="row q-px-lg">
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
          class="col-12"
        >
          <q-card
            class="q-pa-sm q-ma-xs bg-primary text-white"
            @click="pickFileForPeer(peer)"
          >
            <q-icon
              name="mdi-account"
              size="20px"
              class="bg-secondary q-pa-sm"
              style="border-radius: 100%;"
            />
            <span class="q-pl-sm text-subtitle1">{{ peer.nickname }}</span>
            <q-linear-progress
              v-if="peer === selectedPeer"
              indeterminate
              color="secondary"
            />
          </q-card>
        </div>
      </div>
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
const nickname = ref("")
const peersOnline: Ref<SferaPeer[]> = ref([])

const wsConnection = new WebSocket(`ws://${serverIp}:${serverPort}`)
wsConnection.onopen = () => {
  isConnected.value = true
}

const chatMessageList: Ref<string[]> = ref([])
wsConnection.onmessage = async (ev: MessageEvent) => {
  const sferaMsg = JSON.parse(ev.data) as SferaMessage
  console.log(sferaMsg)
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
      const {name, type } = sferaMsg.metadata
      const base64str = sferaMsg.data
      const res = await fetch(`data:${type};base64,${base64str}`)
      const blob = await res.blob()
      const file = new File([blob], name)
      const link = window.document.createElement("a")
      link.href = window.URL.createObjectURL(file)
      link.download = name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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

const fileInput: Ref<HTMLInputElement | null> = ref(null)
const selectedPeer: Ref<SferaPeer | null> = ref(null)
const pickFileForPeer = (peer: SferaPeer) => {
  selectedPeer.value = peer
  if (fileInput.value) {
    fileInput.value.click()
  }
}
const afterPickFile = async () => {
  const file = fileInput.value?.files?.[0]
  if(file) {
    const arrayBuffer = await file.arrayBuffer()
    let byteStr = ""
    const byteArr = new Uint8Array( arrayBuffer )
    for (var i = 0; i < byteArr.byteLength; i++) {
      byteStr += String.fromCharCode( byteArr[ i ] )
    }
    const fileAsBase64 = btoa(byteStr)
    file.type
    const sferaMsg: SferaMessage = {
      type: "file",
      receiver: selectedPeer.value?.nickname,
      data: fileAsBase64,
      metadata: {
        name: file.name,
        type: file.type
      }
    }
    wsConnection.send(JSON.stringify(sferaMsg))
  }
}


</script>

<style scoped lang="sass">
.hidden-file-input
  display: block
  visibility: hidden
  width: 0
  height: 0

.peers-container
  flex: 1
  overflow-y: scroll
</style>
