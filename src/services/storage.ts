/**
 * Storage service for CampusFind AI
 * Uses IndexedDB to store and retrieve photo uploads reliably.
 * Provides client-side image compression to optimize memory and speed.
 */

const DB_NAME = 'CampusFindStorage';
const DB_VERSION = 1;
const STORE_NAME = 'item_photos';

function openPhotoDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported in this environment'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Compresses an image file before storing, generating a clean JPEG data URL
 */
export async function compressAndStorePhoto(file: File): Promise<string> {
  const photoId = 'photo_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const maxDim = 800; // max width/height for fast loading & compact storage
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

          try {
            const db = await openPhotoDB();
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            store.put(dataUrl, photoId);
            tx.oncomplete = () => {
              // Return the dataUrl directly so it immediately renders everywhere
              resolve(dataUrl);
            };
            tx.onerror = () => {
              resolve(dataUrl);
            };
          } catch {
            // Fallback: return dataUrl directly
            resolve(dataUrl);
          }
        } else {
          resolve((e.target?.result as string) || '');
        }
      };
      img.onerror = () => {
        resolve((e.target?.result as string) || '');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}
