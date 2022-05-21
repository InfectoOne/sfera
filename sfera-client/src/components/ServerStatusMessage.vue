<template>
  <div
    v-if="isConnected && peersOnline.length == 0"
    class="column justify-center items-center"
    style="opacity: 0.6;"
  >
    <q-icon
      name="mdi-emoticon-cry"
      size="60px"
    />
    <span class="text-h5">No peers currently online</span>
  </div>
</template>

<script setup lang="ts">
import useSferaConnection from "src/composables/useSferaConnection"

const { isConnected, peersOnline } = useSferaConnection()
</script>
