export async function Chat() {
  return {
    props: ["chatId"],
    components: {
      todo: () => import('./todo.js').then(m => m.Todo()),
      'graffiti-discover': {
        props: ['channels', 'where', 'orderBy', 'limit', 'data', 'autopoll'],
        template: '<slot></slot>'
      }
    },
    data() {
      return {
        messages: [],
        newMessage: "",
        userName: "user",
        userProfile: null,
        loading: true,
        messageSchema: {
          type: "object",
          properties: {
            chatId: { type: "string" },
            id: { type: "number" },
            sender: { type: "string" },
            text: { type: "string" },
            timestamp: { type: "string" }
          },
          required: ["chatId", "id", "sender", "text", "timestamp"]
        }
      };
    },
    inject: ["$graffiti"],
    mounted() {
      this.loadUserProfile();
      // Both load messages from localStorage and Graffiti
      this.loadMessagesFromLocalStorage();
    },
    methods: {
      async sendMessage() {
        if (!this.newMessage.trim()) return;
        
        const newMsg = {
          id: Date.now(),
          sender: this.userName,
          text: this.newMessage,
          timestamp: new Date().toLocaleTimeString(),
          chatId: this.chatId
        };
        
        this.messages.push(newMsg);
        this.newMessage = "";
        
        this.saveMessagesToLocalStorage();
        
        // Also save to Graffiti if available
        if (this.$graffiti) {
          try {
            await this.publishMessageToGraffiti(newMsg);
          } catch (err) {
            console.error("failed to publish message to graffiti:", err);
          }
        }
        
        this.$nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      },
      async publishMessageToGraffiti(message) {
        try {
          await this.$graffiti.publish({
            value: message,
            channels: ["designftw-2025-studio2", `pigeon-chat-${this.chatId}`]
          });
          console.log("message published to graffiti");
        } catch (err) {
          console.error("error publishing message to graffiti:", err);
        }
      },
      handleGraffitiMessages(graffitiMessages) {
        if (!graffitiMessages || !Array.isArray(graffitiMessages)) return;
        
        // Filter for messages matching this chatId and valid schema
        const validMessages = graffitiMessages
          .filter(item => item && item.value && item.value.chatId === this.chatId)
          .map(item => item.value);
        
        if (validMessages.length === 0) return;
        
        // Combine with existing messages, removing duplicates by id
        const messageMap = new Map();
        
        // Add existing messages to map
        this.messages.forEach(msg => messageMap.set(msg.id, msg));
        
        // Add new messages from Graffiti, overwriting if same id
        validMessages.forEach(msg => messageMap.set(msg.id, msg));
        
        // Convert back to array and sort by id
        this.messages = Array.from(messageMap.values())
          .sort((a, b) => a.id - b.id);
        
        // Save the updated list
        this.saveMessagesToLocalStorage();
        
        this.loading = false;
      },
      deleteMessage(index) {
        if (confirm("are you sure you want to delete this message?")) {
          this.messages.splice(index, 1);
          this.saveMessagesToLocalStorage();
        }
      },
      saveMessagesToLocalStorage() {
        localStorage.setItem(`chat_${this.chatId}_messages`, JSON.stringify(this.messages));
      },
      loadMessagesFromLocalStorage() {
        const savedMessages = localStorage.getItem(`chat_${this.chatId}_messages`);
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages);
        }
        this.loading = false;
      },
      loadUserProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          this.userProfile = JSON.parse(savedProfile);
          this.userName = this.userProfile.name.toLowerCase();
        }
      }
    },
    template: await fetch("./chat.html").then((r) => r.text()),
  };
}