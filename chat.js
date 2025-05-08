export async function Chat() {
  return {
    props: ["chatId"],
    data() {
      return {
        messages: [],
        newMessage: "",
        userName: "User",
        userProfile: null,
      };
    },
    mounted() {
      this.loadMessages();
      this.loadUserProfile();
    },
    methods: {
      sendMessage() {
        if (!this.newMessage.trim()) return;

        this.messages.push({
          id: Date.now(),
          sender: this.userName,
          text: this.newMessage,
          timestamp: new Date().toLocaleTimeString(),
        });

        this.newMessage = "";

        this.saveMessages();

        this.$nextTick(() => {
          const messagesContainer = this.$refs.messagesContainer;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      },
      deleteMessage(index) {
        if (confirm("are you sure you want to delete this message?")) {
          this.messages.splice(index, 1);
          this.saveMessages();
        }
      },
      saveMessages() {
        localStorage.setItem(
          `chat_${this.chatId}_messages`,
          JSON.stringify(this.messages)
        );
      },
      loadMessages() {
        const savedMessages = localStorage.getItem(
          `chat_${this.chatId}_messages`
        );
        if (savedMessages) {
          this.messages = JSON.parse(savedMessages);
        }
      },
      loadUserProfile() {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          this.userProfile = JSON.parse(savedProfile);
          this.userName = this.userProfile.name;
        }
      },
    },
    template: await fetch("./chat.html").then((r) => r.text()),
  };
}
