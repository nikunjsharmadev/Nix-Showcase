# COMPRESS IMAGE API NODEJS+EXPRESSJS+SHARP
Developed a high-performance image optimization API powered by Typescript using Node.js, Express.js, MongoDB, and Sharp, reducing image payload sizes by up to 60% with no perceptible loss in visual quality.

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

- The compressed image will open in a new tab automatically

### 8. Expose Standalone API
- form-data:

    key: images, value: [image]

```
http://localhost:5000/compress/api/image
```


