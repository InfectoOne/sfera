import { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("src/App.vue"),
  }
]

export default routes
