export async function Profile() {
  return {
    data() {
      return {
        editing: false,
        previewImage: null,
        profile: this.loadProfile(),
        editedProfile: {},
      };
    },
    methods: {
      loadProfile() {
        const savedProfile = localStorage.getItem("userProfile");
        if (savedProfile) {
          return JSON.parse(savedProfile);
        } else {
          return {
            name: "pigeon pigeon",
            email: "pigeonandplans@gmail.com",
            memberSince: "since the ice age",
            bio: "bleh",
            avatarUrl: "pidove.png",
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

        if (!file.type.match("image.*")) {
          alert("please select an image file");
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
        document.getElementById("profile-pic-input").value = "";
      },
      saveProfile() {
        this.profile = { ...this.editedProfile };

        if (this.previewImage) {
          this.profile.avatarUrl = this.previewImage;
        }

        localStorage.setItem("userProfile", JSON.stringify(this.profile));

        this.editing = false;
        this.previewImage = null;

        alert("profile updated");
      },
    },
    template: await fetch("./profile.html").then((r) => r.text()),
  };
}
