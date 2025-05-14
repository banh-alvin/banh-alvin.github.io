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
        newChatName: "",
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

        this.$nextTick(() => {
          if (
            this.$refs.todoComponent &&
            typeof this.$refs.todoComponent.addChatAsTodo === "function"
          ) {
            this.$refs.todoComponent.addChatAsTodo(`Chat ${newChatId}`);
          } else {
            console.error(
              "Todo component not ready or missing addChatAsTodo method"
            );
          }
        });

        setTimeout(() => {
          this.$router.push(`/chat/${newChatId}`);
        }, 50);
      },
      deleteChat(chatId) {
        if (confirm(`are you sure you want to delete chat ${chatId}?`)) {
          this.chats = this.chats.filter((id) => id !== chatId);

          try {
            localStorage.removeItem(`chat_${chatId}_messages`);
          } catch (err) {
            console.error(
              "Error removing chat messages from localStorage:",
              err
            );
          }

          this.saveChats();

          const currentRoute = this.$router.currentRoute.value;
          if (currentRoute.path === `/chat/${chatId}`) {
            this.$router.push("/");
          }
        }
      },
      saveChats() {
        try {
          localStorage.setItem("chats", JSON.stringify(this.chats));
        } catch (err) {
          console.error("Error saving chats to localStorage:", err);
        }
      },
      loadChats() {
        try {
          const savedChats = localStorage.getItem("chats");
          if (savedChats) {
            this.chats = JSON.parse(savedChats);
          } else {
            this.chats = [1, 2];
            this.saveChats();
          }
        } catch (err) {
          console.error("Error loading chats from localStorage:", err);
          this.chats = [1, 2];
          this.saveChats();
        }
      },
    },
    template: `
    <div class="app-container">
      <div class="main-content">
        <button @click="addChat" class="add-chat-btn">add a chat</button>
        <ul class="chat-list">
          <li v-for="chat in chats" :key="chat" class="chat-item">
            <router-link :to="'/chat/' + chat" class="chat-link">
              chat {{ chat }}
            </router-link>
            <button @click="deleteChat(chat)" class="delete-chat-btn">❌</button>
          </li>
        </ul>
        <p>a wild cat appeared!</p>
        <img src="webcat.png" />
      </div>
    </div>
    `,
  };
}
