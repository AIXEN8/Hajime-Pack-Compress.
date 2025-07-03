// Kompresi gambar dan zip file Office di browser
// By Hajime Pack

function isImage(file) {
  return /image\/(jpeg|png)/.test(file.type);
}

function isOffice(file) {
  return /\.(ppt|pptx|doc|docx)$/i.test(file.name);
}

async function compressImage(file, quality = 0.6) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxW = 1280;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          quality
        );
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function zipFile(file) {
  // JSZip CDN
  if (!window.JSZip) {
    await new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src =
        "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      s.onload = res;
      s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  const zip = new JSZip();
  zip.file(file.name, file);
  return zip.generateAsync({ type: "blob" });
}

document
  .getElementById("compressForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];
    if (!file) return;
    let resultBlob, resultName;
    if (isImage(file)) {
      resultBlob = await compressImage(file, 0.6);
      resultName = file.name.replace(/\.(jpg|jpeg|png)$/i, "_compressed.jpg");
    } else if (isOffice(file)) {
      resultBlob = await zipFile(file);
      resultName = file.name + ".zip";
    } else {
      alert("File tidak didukung. Pilih gambar, PPT, atau Word.");
      return;
    }
    const resultDiv = document.getElementById("result");
    const downloadLink = document.getElementById("downloadLink");
    downloadLink.href = URL.createObjectURL(resultBlob);
    downloadLink.download = resultName;
    resultDiv.classList.remove("hidden");
    resultDiv.style.animation = "fadeInResult 0.7s cubic-bezier(.4,0,.2,1)";
    setTimeout(() => {
      resultDiv.style.animation = "";
    }, 800);
  });
