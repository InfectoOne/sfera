import { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("src/pages/ConnectionPage.vue"),
  },
  {
    path: "/peers",
    component: () => import("src/pages/PeersPage.vue"),
  },
]

export default routes
