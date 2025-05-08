import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";
import { Todo } from "./todo.js";

export async function ChatList() {
  return {
    components: {
      Chat: defineAsyncComponent(Chat),
      Todo: defineAsyncComponent(Todo),
    },
    data() {
      return {
        chats: [],
        selectedChat: null,
      };
    },
    mounted() {
      this.loadChats();
    },
    activated() {
      this.loadChats();
    },
    methods: {
      addChat() {
        const newChatId =
          this.chats.length > 0 ? Math.max(...this.chats) + 1 : 1;
        this.chats.push(newChatId);

        this.saveChats();

        setTimeout(() => {
          this.$router.push(`/chat/${newChatId}`);
        }, 50);
      },
      deleteChat(chatId) {
        if (confirm(`are you sure you want to delete chat ${chatId}?`)) {
          this.chats = this.chats.filter((id) => id !== chatId);

          localStorage.removeItem(`chat_${chatId}_messages`);

          this.saveChats();

          const currentRoute = this.$router.currentRoute.value;
          if (currentRoute.path === `/chat/${chatId}`) {
            this.$router.push("/");
          }
        }
      },
      saveChats() {
        localStorage.setItem("chats", JSON.stringify(this.chats));
      },
      loadChats() {
        const savedChats = localStorage.getItem("chats");
        if (savedChats) {
          this.chats = JSON.parse(savedChats);
        } else {
          this.chats = [1, 2];
          this.saveChats();
        }
      },
    },
    template: await fetch("./chat-list.html").then((r) => r.text()),
  };
}
