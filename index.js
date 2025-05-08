import { createApp, defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { ChatList } from "./chat-list.js";
import { Chat } from "./chat.js";
import { Profile } from "./profile.js";
import { Todo } from "./todo.js";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: ChatList },
    { path: "/chat/:chatId", component: Chat, props: true },
    { path: "/profile", component: Profile },
    { path: "/todo", component: Todo },
  ],
});

createApp({
  components: {
    ChatList: defineAsyncComponent(ChatList),
    Todo: defineAsyncComponent(Todo),
  },
})
  .use(router)
  .mount("#app");
