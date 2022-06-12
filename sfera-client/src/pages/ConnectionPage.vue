<template>
  <div
    class="column"
    style="height: 100vh;"
  >
    <div
      class="column justify-center items-center q-pa-md bg-primary"
      style="height: 30vh"
    >
      <span class="text-h5 text-weight-bold">Sfera</span>
    </div>
    <q-card
      class="q-px-xs column justify-center items-center q-gutter-y-sm"
      style="flex:1"
    >
      <q-input
        v-model="ipAddress"
        label="Server Address"
        filled
      />
      <q-input
        v-model="port"
        label="Server Port"
        filled
      />
      <q-btn
        label="Connect!"
        color="primary"
        icon="mdi-connection"
        class="q-mt-md"
        @click="tryConnect()"
      />
    </q-card>
  </div>
</template>

<script setup lang="ts">
import useSferaConnection from "src/composables/useSferaConnection"
import { ref } from "vue"
import { useRouter } from "vue-router"

const ipAddress = ref("")
const port = ref("")

const { connect } = useSferaConnection()
const router = useRouter()
const tryConnect = () => {
  connect(ipAddress.value, Number(port.value))
  router.push("/peers")
}
</script>
