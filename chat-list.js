import { defineAsyncComponent } from "vue";
import { Chat } from "./chat.js";

export async function ChatList() {
  return {
    data() {
      return {
        chats: [1, 2],
      };
    },
    methods: {
      addChat() {
        this.chats.push(this.chats.length + 1);
      },
    },
    template: `
      <button @click="addChat">Add a chat</button>
      <ul>
        <li v-for="chat in chats" :key="chat">
          <router-link :to="'/chat/' + chat">Chat {{ chat }}</router-link>
        </li>
      </ul>
    `,
  };
}