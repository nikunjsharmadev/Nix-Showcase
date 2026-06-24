const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const uploadForm = document.getElementById("uploadForm");
let currentFile = null;
// Listen for when a file is selected
imageInput.addEventListener("change", function () {
  const file = this.files[0];
  currentFile = file;
  if (file) {
    const reader = new FileReader();

    // Once the file is loaded, set the image source and display it
    reader.addEventListener("load", function () {
      imagePreview.setAttribute("src", this.result);
      imagePreview.style.display = "block";
    });

    reader.readAsDataURL(file);
  } else {
    // Hide the preview if the user cancels the selection
    imagePreview.style.display = "none";
    imagePreview.setAttribute("src", "");
  }
});

// Optional: Prevent default form submission to handle the upload via an API later
uploadForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("images", imageInput.files[0]);
  console.log(formData);
  const response = await fetch("http://127.0.0.1:5000/compress/api/image", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();
  const url = `http://127.0.0.1:5000/compress/compressed/${data.file}`;
  window.open(url, "_blank");
});
