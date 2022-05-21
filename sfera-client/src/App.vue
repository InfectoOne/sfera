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
        <div
          v-if="showTooltip"
          ref="arrowUp"
          class="arrow-up"
        />
        <q-tooltip
          v-model="showTooltip"
          :offset="[-22, 5]"
          anchor="bottom left"
          style="width: 230px; margin-right: 10px;"
        >
          Connected! This is your nickname.
        </q-tooltip>
      </div>
    </q-toolbar>

    <q-separator />
    <server-status-message />

    <div class="column peers-container justify-center items-center">
      <div class="row q-px-lg">
        <peer-card
          v-for="peer in peersOnline"
          :key="peer.nickname"
          :peer="peer"
          class="col-12"
        />
      </div>
    </div>
    <div
      class="row justify-center q-py-sm text-caption"
      style="opacity: 0.6"
    >
      Click on a peer to send a file.
    </div>
  </div>
</template>

<script setup lang="ts">
import useSferaConnection from "./composables/useSferaConnection"
import PeerCard from "./components/PeerCard.vue"
import { ref, watch } from "vue"
import { QTooltip } from "quasar"
import ServerStatusMessage from "src/components/ServerStatusMessage.vue"

const { nickname, peersOnline } = useSferaConnection()

const showTooltip = ref(false)
watch(nickname, () => {
  showTooltip.value = true
  setTimeout(() => showTooltip.value = false, 5000)
})

</script>

<style scoped lang="sass">
.peers-container
  flex: 1
  overflow-y: scroll
.arrow-up
  width: 0
  height: 0
  border-left: 10px solid transparent
  border-right: 10px solid transparent
  border-bottom: 10px solid #757575
  position: absolute
  top: 32px
  right: 50px
  z-index: 20
</style>
