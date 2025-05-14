import { createApp, defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory } from "vue-router";
import { ChatList } from "./chat-list.js";
import { Chat } from "./chat.js";
import { Profile } from "./profile.js";
import { Todo } from "./todo.js";
import { GraffitiPlugin } from "@graffiti-garden/wrapper-vue";
import { GraffitiLocal } from "@graffiti-garden/implementation-local";
import { GraffitiRemote } from "@graffiti-garden/implementation-remote";

const Login = {
  template: `
    <div class="login-container">
      <h2>welcome to pigeon</h2>
      <button @click="$graffiti.login()" class="login-btn">
        log in with solid
      </button>
    </div>
  `,
};

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: ChatList },
    { path: "/chat/:chatId", component: Chat, props: true },
    { path: "/profile", component: Profile },
    { path: "/todo", component: Todo },
    { path: "/login", component: Login },
  ],
});

const app = createApp({
  data() {
    return {
      isLoggedIn: false,
      localUsername: "Guest",
    };
  },
  computed: {
    username() {
      if (
        this.isLoggedIn &&
        this.$graffitiSession &&
        this.$graffitiSession.value
      ) {
        const actorId = this.$graffitiSession.value.actor;
        if (actorId) {
          const parts = actorId.split("/");
          if (parts.length > 0) {
            return parts[parts.length - 1];
          }
        }
      }

      return this.localUsername;
    },
  },
  mounted() {
    this.$watch(
      "$graffitiSession.value",
      (newSession) => {
        console.log("Session changed:", newSession ? "active" : "inactive");
        this.isLoggedIn = !!newSession;

        if (!newSession && this.$route.path !== "/login") {
          console.log("Not logged in, redirecting to login page");
          this.$router.push("/login");
        } else if (newSession && this.$route.path === "/login") {
          console.log("Logged in, redirecting to home page");
          this.$router.push("/");
        }
      },
      { immediate: true }
    );

    setInterval(() => {
      const clockElement = document.getElementById("clock");
      if (clockElement) {
        clockElement.textContent =
          "it's " + new Date().toLocaleTimeString() + " :)";
      }
    }, 1000);
  },
  methods: {
    handleLogout() {
      console.log("Logout clicked");

      this.isLoggedIn = false;

      this.$router.push("/login");

      if (this.$graffiti) {
        console.log("Initiating Graffiti logout");
        this.$graffiti
          .logout()
          .then(() => {
            console.log("Logout successful");
          })
          .catch((err) => {
            console.error("Logout error:", err);
          });
      } else {
        console.error("Graffiti not available for logout");
      }
    },
  },
  template: `
    <div>
      <h1>
        <router-link to="/"> 🕊 </router-link>
      </h1>
      
      <div class="user-status" v-if="isLoggedIn">
        <div class="user-info">
          <span> hi </span>
          <strong class="username">{{ username }}</strong>
        </div>
        <button @click="handleLogout" class="logout-btn">log out</button>
      </div>
      
      <div class="current-time" id="clock"></div>
      
      <nav v-if="isLoggedIn">
        <router-link to="/">Home</router-link>
        <router-link to="/profile">Profile</router-link>
        <router-link to="/todo">Todo List</router-link>
      </nav>

      <router-view></router-view>
    </div>
  `,
});

app.use(router);
app.use(GraffitiPlugin, {
  graffiti: new GraffitiRemote(),
  // graffiti: new GraffitiLocal(),
});

app.mount("#app");
