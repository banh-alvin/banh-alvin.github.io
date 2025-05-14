
export async function Profile() {
  return {
    data() {
      return {
        editing: false,
        previewImage: null,
        profile: this.loadProfile(),
        editedProfile: {},
        solidLoggedIn: false
      };
    },
    inject: ["$graffiti", "$graffitiSession"],
    created() {
      this.checkSolidLogin();
    },
    methods: {
      loadProfile() {
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          return JSON.parse(savedProfile);
        } else {
          return {
            name: "pigeon pigeon",
            email: "pigeonandplans@gmail.com",
            memberSince: "since the ice age",
            bio: "bleh",
            avatarUrl: "pidove.png"
          };
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
        
        if (!file.type.match('image.*')) {
          alert('please select an image file');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('image size should be less than 5mb');
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
        document.getElementById('profile-pic-input').value = '';
      },
      async saveProfile() {
        this.profile = { ...this.editedProfile };
        
        if (this.previewImage) {
          this.profile.avatarUrl = this.previewImage;
        }
        
        localStorage.setItem('userProfile', JSON.stringify(this.profile));
        
        if (this.solidLoggedIn) {
          await this.saveToGraffiti();
        }
        
        this.editing = false;
        this.previewImage = null;
        
        alert("profile updated");
      },
      async checkSolidLogin() {
        if (this.$graffitiSession && this.$graffitiSession.value && this.$graffitiSession.value.actor) {
          this.solidLoggedIn = true;
          await this.loadFromGraffiti();
        }
      },
      async saveToGraffiti() {
        try {
          if (!this.$graffiti || !this.$graffitiSession.value || !this.$graffitiSession.value.actor) {
            console.warn("not logged in with solid, skipping graffiti profile save");
            return;
          }

          const profileData = {
            value: {
              name: this.profile.name,
              email: this.profile.email, 
              bio: this.profile.bio,
              memberSince: this.profile.memberSince,
              avatarUrl: this.profile.avatarUrl,
              generator: "https://banh-alvin.github.io/",
              describes: this.$graffitiSession.value.actor
            },
            channels: [
              "designftw-2025-studio2",
              "pigeon-app-profiles"
            ]
          };

          await this.$graffiti.publish(profileData);
          console.log("profile saved to graffiti");
        } catch (err) {
          console.error("error saving profile to graffiti:", err);
        }
      },
      async loadFromGraffiti() {
        try {
          if (!this.$graffiti || !this.$graffitiSession.value || !this.$graffitiSession.value.actor) {
            return;
          }

          const discoveredProfiles = await this.$graffiti.discover({
            channels: ["designftw-2025-studio2", "pigeon-app-profiles"],
            where: profile => 
              profile.value.describes === this.$graffitiSession.value.actor
          });

          if (discoveredProfiles && discoveredProfiles.length > 0) {
            const latestProfile = discoveredProfiles[0].value;
            
            this.profile = {
              name: latestProfile.name || this.profile.name,
              email: latestProfile.email || this.profile.email,
              bio: latestProfile.bio || this.profile.bio,
              memberSince: latestProfile.memberSince || this.profile.memberSince,
              avatarUrl: latestProfile.avatarUrl || this.profile.avatarUrl
            };
            
            localStorage.setItem('userProfile', JSON.stringify(this.profile));
            console.log("profile loaded from graffiti");
          }
        } catch (err) {
          console.error("error loading profile from graffiti:", err);
        }
      },
      async loginWithSolid() {
        try {
          if (!this.$graffiti) {
            console.error("graffiti not available");
            return;
          }
          
          await this.$graffiti.login();
          this.solidLoggedIn = true;
          await this.loadFromGraffiti();
        } catch (err) {
          console.error("error logging in with solid:", err);
        }
      },
      async logoutFromSolid() {
        try {
          if (!this.$graffiti) {
            return;
          }
          
          await this.$graffiti.logout();
          this.solidLoggedIn = false;
        } catch (err) {
          console.error("error logging out from solid:", err);
        }
      }
    },
    template: await fetch("./profile.html").then((r) => r.text()),
  };
}