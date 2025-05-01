import { createApp } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { ChatList } from "./chat-list.js";
import { Chat } from "./chat.js";
import { Profile } from "./profile.js";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: ChatList },
    { path: "/chat/:chatId", component: Chat, props: true },
    { path: "/profile", component: Profile },
  ],
});

const app = createApp({
  components: {
    ChatList,
    Chat,
    Profile,
  },
});

app.use(router).mount("#app");