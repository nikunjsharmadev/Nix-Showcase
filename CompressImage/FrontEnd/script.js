const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const uploadForm = document.getElementById('uploadForm');
const progressFill = document.getElementById('progressFill');
const progress = document.getElementById('progress');
const imageUrl = document.getElementById('imageUrl');
const submitBtn = document.getElementById('submitBtn');
let currentFile = null;

function updateProgress(progress) {
  progressFill.style.width = `${progress}%`;
  progressFill.textContent = `${progress}%`;
}
const socket = io('https://127.0.0.1:5000', { secure: true });
socket.emit('join', { userId: socket.id });
socket.on('image-progress', (progress) => {
  updateProgress(progress.data);
});
let url = '';
socket.on('image-completed', (data) => {
  imageUrl.toggleAttribute('hidden', false);
  progress.toggleAttribute('hidden', true);
  submitBtn.toggleAttribute('hidden', false);
  updateProgress(0);
  url = `https://127.0.0.1:5000/download/${data[0]['fileName']}`;
});
imageUrl.addEventListener('click', () => {
  window.open(url, '_self');
});
// Listen for when a file is selected
imageInput.addEventListener('change', function () {
  const file = this.files[0];
  currentFile = file;
  if (file) {
    const reader = new FileReader();
    // Once the file is loaded, set the image source and display it
    reader.addEventListener('load', function () {
      imagePreview.setAttribute('src', this.result);
      imagePreview.style.display = 'block';
    });
    reader.readAsDataURL(file);
  } else {
    // Hide the preview if the user cancels the selection
    imagePreview.style.display = 'none';
    imagePreview.setAttribute('src', '');
  }
});
// Optional: Prevent default form submission to handle the upload via an API later
uploadForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  progress.toggleAttribute('hidden', false);
  submitBtn.toggleAttribute('hidden', true);
  const formData = new FormData();
  formData.append('images', imageInput.files[0]);
  formData.append('userId', socket.id);
  const response = await fetch('https://127.0.0.1:5000/api/image', {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
});
