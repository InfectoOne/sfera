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
        <peer-card
          v-for="peer in peersOnline"
          :key="peer.nickname"
          :peer="peer"
          class="col-12"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import useSferaConnection from "./composables/useSferaConnection"
import PeerCard from "./components/PeerCard.vue"

const {nickname, peersOnline } = useSferaConnection()

</script>

<style scoped lang="sass">
.peers-container
  flex: 1
  overflow-y: scroll
</style>
