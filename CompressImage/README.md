# Compress Image Node+Express+Sharp
Developed a high-performance image optimization API powered by Typescript using Node.js, Express.js, MongoDB, and Sharp, reducing image payload sizes by up to 60% with no perceptible loss in visual quality.

<img width="799" height="1011" alt="Screenshot 2026-08-09 092809" src="https://github.com/user-attachments/assets/d64a76d6-7b7e-4dc6-827f-e411b03ed5f6" />
<img width="754" height="1045" alt="Screenshot 2026-08-09 092818" src="https://github.com/user-attachments/assets/d245c34b-3902-48bb-8a5f-98f3f8fd1470" />

# BackEnd is with docker container
Live: [https://nikunjsharmadev.github.io/Nix-Showcase/CompressImage/FrontEnd/](https://nikunjsharmadev.github.io/Nix-Showcase/compress-image/)

# Image Compression Project
## Prerequisites

- Node.js v20.20.2
## Steps to Use

### 1. Download Project
Download the ZIP file of the project and extract it.

---

### 2. Navigate to Project Folder

```bash
cd CompressImage
```

---

### 3. Install Dependencies

```bash
npm install
```

---

### 4. Start the Server

```bash
node server.js
```

---

### 5. Open in Browser

Go to:

```
http://localhost:5000/
```

---

### 6. Upload Image

- Choose an image file from your system
- Upload it using the UI

---

### 7. View Compressed Image

- The compressed can download from UI

### 8. Expose Standalone API
- form-data:

    key: images, value: [image]

```
http://localhost:5000/compress/api/image
```


