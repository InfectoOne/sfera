<template>
  <div
    class="column justify-center items-center"
    style="opacity: 0.6;"
  >
    <template v-if="isConnected && peersOnline.length == 0">
      <q-icon
        name="mdi-emoticon-cry"
        size="60px"
      />
      <span class="text-h6">No peers currently online</span>
    </template>
    <template v-if="!isConnected">
      <q-icon
        name="mdi-lan-disconnect"
        size="65px"
      />
      <span class="text-h6">No connection with the Sfera server.</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import useSferaConnection from "src/composables/useSferaConnection"

const { isConnected,  peersOnline } = useSferaConnection()
</script>
