<template>
  <q-card
    class="q-pa-sm q-ma-xs bg-primary text-white"
    @click="pickFileForPeer()"
  >
    <q-icon
      name="mdi-account"
      size="20px"
      class="bg-secondary q-pa-sm"
      style="border-radius: 100%;"
    />
    <span class="q-pl-sm text-subtitle1">{{ peer.nickname }}</span>
    <q-linear-progress
      indeterminate
      color="secondary"
    />
    <!-- invisible file-input element that can be accessed by clicking on the project image (or the placeholder) -->
    <input
      ref="fileInput"
      class="hidden-file-input"
      type="file"
      @change="afterPickFile()"
    >
  </q-card>
</template>

<script setup lang="ts">
import useSferaConnection from "src/composables/useSferaConnection"
import SferaPeer from "src/models/SferaPeer"
import { Ref, ref, toRefs } from "vue"

const props = defineProps<{
  peer: SferaPeer
}>()

const { peer } = toRefs(props)

const fileInput: Ref<HTMLInputElement | null> = ref(null)
const { sendFileTo } = useSferaConnection()

const afterPickFile = async () => {
  const file = fileInput.value?.files?.[0]
  if( file ) {
    sendFileTo(file, peer.value.nickname)
  }
}

const pickFileForPeer = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

</script>
