import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { getImageUrl, API_BASE } from '../config';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
};

export const saveImageToPhone = async (imageUrl, showToast) => {
  if (!imageUrl) {
    if (showToast) showToast('No image to download');
    return false;
  }

  const fullUrl = getImageUrl(imageUrl);
  const rawFilename = imageUrl.split('?')[0].split('/').pop() || `image_${Date.now()}`;
  const cleanExt = rawFilename.endsWith('.png') ? 'png' : (rawFilename.endsWith('.webp') ? 'webp' : 'jpg');
  const targetFilename = `zenivio_${Date.now()}.${cleanExt}`;

  if (showToast) showToast('Downloading image... 📥');

  // 1. Native Capacitor (Android APK) Storage
  if (Capacitor.isNativePlatform()) {
    try {
      if (typeof Filesystem.downloadFile === 'function') {
        const downloadRes = await Filesystem.downloadFile({
          url: fullUrl,
          path: targetFilename,
          directory: Directory.Documents
        });
        if (downloadRes && downloadRes.path) {
          if (showToast) showToast('Image saved to Documents! ✨');
          return true;
        }
      }

      const response = await fetch(fullUrl, { mode: 'cors' });
      const blob = await response.blob();
      const base64DataWithPrefix = await blobToBase64(blob);
      const base64Data = base64DataWithPrefix.split(',')[1] || base64DataWithPrefix;

      await Filesystem.writeFile({
        path: targetFilename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      if (showToast) showToast('Image saved to your phone! 📁✨');
      return true;
    } catch (nativeErr) {
      console.warn('Native filesystem write failed, falling back to browser download:', nativeErr);
    }
  }

  // 2. Web & Mobile Browser Direct Attachment Download
  try {
    const downloadUrl = fullUrl.includes('/api/image') 
      ? `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}download=1&filename=${encodeURIComponent(targetFilename)}`
      : fullUrl;

    const response = await fetch(downloadUrl, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch failed');

    const blob = await response.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = targetFilename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 2000);
    if (showToast) showToast('Image downloaded to your phone! 📥✨');
    return true;
  } catch (webErr) {
    console.warn('Direct blob anchor download failed, attempting Canvas fallback:', webErr);
    
    // 3. Canvas DataURL Fallback
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = targetFilename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        if (showToast) showToast('Image downloaded! 📥✨');
      };
      img.onerror = () => {
        const directDl = fullUrl.includes('/api/image')
          ? `${fullUrl}${fullUrl.includes('?') ? '&' : '?'}download=1`
          : fullUrl;
        window.open(directDl, '_system');
      };
      img.src = fullUrl;
      return true;
    } catch (canvasErr) {
      window.open(fullUrl, '_system');
      return false;
    }
  }
};
