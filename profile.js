// UPDATED profile.js with login integration
export async function Profile() {
  return {
    data() {
      return {
        editing: false,
        previewImage: null,
        profile: {
          name: "pigeon pigeon",
          email: "pigeonandplans@gmail.com",
          memberSince: "since the ice age",
          bio: "bleh",
          avatarUrl: "pidove.png",
        },
        editedProfile: {},
        errorMessage: null,
      };
    },
    inject: {
      $graffiti: { default: null },
      $graffitiSession: { default: null },
    },
    created() {
      this.loadProfileFromStorage();
      this.loadProfileFromGraffiti();
    },
    computed: {
      isLoggedIn() {
        return this.$graffitiSession && this.$graffitiSession.value;
      },
      username() {
        if (!this.$graffitiSession || !this.$graffitiSession.value) {
          return "Guest";
        }

        const actorId = this.$graffitiSession.value.actor;
        if (actorId) {
          const parts = actorId.split("/");
          if (parts.length > 0) {
            return parts[parts.length - 1];
          }
        }

        return "Guest";
      },
    },
    methods: {
      loadProfileFromStorage() {
        try {
          const savedProfile = localStorage.getItem("userProfile");
          if (savedProfile) {
            this.profile = JSON.parse(savedProfile);
          }
        } catch (err) {
          console.error("Error loading profile from localStorage:", err);
        }
      },
      async loadProfileFromGraffiti() {
        if (
          !this.$graffiti ||
          !this.$graffitiSession ||
          !this.$graffitiSession.value
        ) {
          console.log("Not logged in or Graffiti not available");
          return;
        }

        try {
          const actorId = this.$graffitiSession.value.actor;
          console.log("Looking for profile with actor ID:", actorId);

          const discoveredProfiles = await this.$graffiti.discover({
            channels: ["designftw-2025-studio2", "pigeon-app-profiles"],
            where: (profile) =>
              profile.value && profile.value.describes === actorId,
          });

          console.log("Discovered profiles:", discoveredProfiles);

          if (discoveredProfiles && discoveredProfiles.length > 0) {
            const latestProfile = discoveredProfiles[0].value;

            this.profile = {
              name: latestProfile.name || this.profile.name,
              email: latestProfile.email || this.profile.email,
              bio: latestProfile.bio || this.profile.bio,
              memberSince:
                latestProfile.memberSince || this.profile.memberSince,
              avatarUrl: latestProfile.avatarUrl || this.profile.avatarUrl,
            };

            localStorage.setItem("userProfile", JSON.stringify(this.profile));
            console.log("Profile loaded from Graffiti");
          }
        } catch (err) {
          console.error("Error loading profile from Graffiti:", err);
        }
      },
      startEditing() {
        this.editedProfile = JSON.parse(JSON.stringify(this.profile));
        this.previewImage = null;
        this.editing = true;
      },
      cancelEditing() {
        this.editing = false;
        this.previewImage = null;
      },
      handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match("image.*")) {
          alert("please select an image file");
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          alert("image size should be less than 5mb");
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          this.previewImage = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      cancelImageUpload() {
        this.previewImage = null;
        const input = document.getElementById("profile-pic-input");
        if (input) input.value = "";
      },
      async saveProfile() {
        try {
          this.profile = { ...this.editedProfile };

          if (this.previewImage) {
            this.profile.avatarUrl = this.previewImage;
          }

          localStorage.setItem("userProfile", JSON.stringify(this.profile));

          if (this.isLoggedIn && this.$graffiti) {
            try {
              await this.saveProfileToGraffiti();
            } catch (err) {
              console.error("Error saving to Graffiti:", err);
            }
          }

          this.editing = false;
          this.previewImage = null;

          alert("profile updated");
        } catch (err) {
          console.error("Error saving profile:", err);
          this.errorMessage =
            "Failed to save profile: " + (err.message || "Unknown error");
        }
      },
      async saveProfileToGraffiti() {
        if (
          !this.$graffiti ||
          !this.$graffitiSession ||
          !this.$graffitiSession.value
        ) {
          console.warn("Not logged in, skipping Graffiti profile save");
          return;
        }

        const actorId = this.$graffitiSession.value.actor;

        const profileData = {
          value: {
            name: this.profile.name,
            email: this.profile.email,
            bio: this.profile.bio,
            memberSince: this.profile.memberSince,
            avatarUrl: this.profile.avatarUrl,
            generator: window.location.origin,
            describes: actorId,
          },
          channels: ["designftw-2025-studio2", "pigeon-app-profiles"],
        };

        try {
          await this.$graffiti.put(profileData, this.$graffitiSession.value);
          console.log("Profile saved to Graffiti");
        } catch (err) {
          console.error("Error saving profile to Graffiti:", err);
          throw err;
        }
      },
    },
    template: `
    <div class="profile-container">
      <h2>user profile</h2>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div v-if="!editing" class="profile-view">
        <img :src="profile.avatarUrl || 'https://via.placeholder.com/150'" alt="profile picture" class="profile-pic">
        <div class="profile-details">
          <h3>{{ profile.name }}</h3>
          <p>{{ profile.email }}</p>
          <p>member since: {{ profile.memberSince }}</p>
          <p v-if="profile.bio">{{ profile.bio }}</p>
        </div>
        <div class="profile-actions">
          <button @click="startEditing" class="edit-button">edit profile</button>
        </div>
      </div>
      
      <form v-else @submit.prevent="saveProfile" class="profile-form">
        <div class="form-group profile-pic-upload">
          <img :src="previewImage || editedProfile.avatarUrl || 'https://via.placeholder.com/150'" alt="profile picture" class="profile-pic">
          <div class="upload-controls">
            <label for="profile-pic-input" class="upload-button">
              choose photo
              <input 
                type="file" 
                id="profile-pic-input" 
                @change="handleImageUpload" 
                accept="image/*"
                style="display: none;">
            </label>
            <button type="button" v-if="previewImage" @click="cancelImageUpload" class="cancel-upload-button">remove</button>
          </div>
        </div>
        
        <div class="form-group">
          <label for="name">name</label>
          <input type="text" id="name" v-model="editedProfile.name" required>
        </div>
        
        <div class="form-group">
          <label for="email">email</label>
          <input type="email" id="email" v-model="editedProfile.email" required>
        </div>
        
        <div class="form-group">
          <label for="bio">bio</label>
          <textarea id="bio" v-model="editedProfile.bio" rows="3"></textarea>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="save-button">save changes</button>
          <button type="button" @click="cancelEditing" class="cancel-button">cancel</button>
        </div>
      </form>
    </div>
    `,
  };
}
