import { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Connect",
    component: () => import("src/pages/ConnectionPage.vue"),
  },
  {
    path: "/peers",
    name: "Peers",
    component: () => import("src/pages/PeersPage.vue"),
  },
]

export default routes
