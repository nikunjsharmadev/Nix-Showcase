const imageInput = document.getElementById('imageInput');
const imagePreviews = document.getElementById('imagePreviews');
const uploadForm = document.getElementById('uploadForm');
const progressFill = document.getElementById('progressFill');
const progress = document.getElementById('progress');
const imageUrl = document.getElementById('imageUrl');
const submitBtn = document.getElementById('submitBtn');
const fileList = document.getElementById('file-list');
const serverDown = document.getElementById('server-down');
const fileUpload = document.getElementById('file-upload');
const spinner = document.getElementById('spinner');
const BACKEND = 'https://3.99.131.248:4000';
let imageCounter = 0;
const socket = io(`${BACKEND}`, { autoConnect: false, secure: true });
const checkApi = async () => {
  const controller = new AbortController();
  const timeOut = setTimeout(() => {
    controller.abort();
  }, 5000);
  try {
    const response = await fetch(`${BACKEND}/api`, {
      method: 'GET',
      signal: controller.signal,
    });
    const { success, message } = await response.json();
    return {
      success,
      message,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  } finally {
    clearTimeout(timeOut);
  }
};
window.addEventListener('DOMContentLoaded', async () => {
  const isApiUp = await checkApi();
  console.info(`${isApiUp.message}`);
  spinner.toggleAttribute('hidden', true);
  serverDown.toggleAttribute('hidden', !!isApiUp.success);
  fileUpload.toggleAttribute('hidden', !isApiUp.success);
  socket.emit('join', { userId: socket.id });
});
function updateProgress(progress) {
  progressFill.style.width = `${progress}%`;
  progressFill.textContent = `${progress}%`;
}
socket.on('image-progress', (progress) => {
  updateProgress(progress.data);
});
socket.on('image-completed', (data) => {
  let list = fileList.innerHTML;
  for (let i = data.length - 1; i > -1; i--) {
    let { fileName, originalSize, compressedSize } = file;
    const reduction = (((originalSize - compressedSize) / originalSize) * 100).toFixed(1);
    originalSize = (originalSize / 1024 / 1024).toFixed(2);
    compressedSize = (compressedSize / 1024 / 1024).toFixed(2);
    imageCounter += 1;
    list += `<div class="file-item">
    <span class="file-name">image${imageCounter}, ${originalSize}mb 🛠️ ${compressedSize}mb (<strong>${reduction}%</strong>)</span>
    <a href="${BACKEND}/download/${fileName}" download>Download</a>
    </div>`;
  }
  submitBtn.toggleAttribute('disabled', true);
  setTimeout(() => {
    progress.toggleAttribute('hidden', true);
    updateProgress(5);
    fileList.innerHTML = list;
  }, 5000);
});
// Listen for when a file is selected
imageInput.addEventListener('change', function () {
  const files = Array.from(this.files);
  const invalidFiles = files.filter((file) => !file.type.startsWith('image/'));
  if (invalidFiles.length > 0) {
    alert('Only image files are allowed.');
    this.value = '';
    return;
  }
  if (files.length > 5) {
    alert('Only 5 images allowed at a time');
    this.value = '';
    return;
  }
  imagePreviews.innerHTML = '';
  if (files.length > 0) {
    submitBtn.toggleAttribute('disabled', false);
    files.forEach((file) => {
      const reader = new FileReader();
      let { name, size } = file;
      size = (size / 1024 / 1024).toFixed(2);
      reader.addEventListener('load', function () {
        const img = document.createElement('img');
        img.setAttribute('title', `name: ${name}\nsize: ${size}mb`);
        img.setAttribute('src', this.result);
        img.style.display = 'block';
        img.style.width = '150px';
        img.style.height = '150px';
        img.style.objectFit = 'cover';
        img.style.margin = '5px';
        imagePreviews.appendChild(img);
      });
      reader.readAsDataURL(file);
    });
  } else {
    imagePreviews.innerHTML = '';
  }
});
uploadForm.addEventListener('submit', async function (e) {
  e.preventDefault();
  progress.toggleAttribute('hidden', false);
  submitBtn.toggleAttribute('disabled', true);
  const formData = new FormData();
  Array.from(imageInput.files).forEach((file) => {
    formData.append('images', file);
  });
  formData.append('userId', socket.id);
  const response = await fetch(`${BACKEND}/api/image`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();
});
