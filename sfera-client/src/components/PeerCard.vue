<template>
  <q-card
    class="q-pa-sm q-ma-xs bg-primary text-white"
    :style="{opacity: isSending ? 0.5 :1 }"
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
      v-if="isSending"
      indeterminate
      color="secondary"
      size="10px"
    />
    <!-- invisible file-input element that can be accessed by clicking on the project image (or the placeholder) -->
    <input
      ref="fileInput"
      class="hidden-file-input"
      type="file"
      multiple
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
const { isSending, sendFile } = useSferaConnection(peer.value)

const afterPickFile = async () => {
  const fileList = fileInput.value?.files
  if (fileList && sendFile) {
    for(const file of fileList) {
      void sendFile(file)
    }
  }
}

const pickFileForPeer = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

</script>
