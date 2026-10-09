// Uploaded image ko chhota karte hain (data URL DB me jaata hai, isliye size
// control zaroori hai). Target ~700kb se kam — tab body comfortably chalti hai.
// Blog cover image aur admin photo editor dono yahi use karte hain.
export const MAX_IMAGE_WIDTH = 1280;
export const MAX_DATA_URL_LENGTH = 900_000;

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Image read nahi ho payi.'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image load nahi ho payi.'));
    image.src = src;
  });
}

export async function compressImageFile(file: File): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  // SVG/GIF ko compress nahi kar sakte (quality/style bigotti jaati hai) —
  // unhe as-is chhod dete hain agar size theek ho.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    if (dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error('Image bahut badi hai (limit ~700KB). Chhoti image chunein.');
    }
    return dataUrl;
  }

  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MAX_IMAGE_WIDTH / (image.naturalWidth || MAX_IMAGE_WIDTH));
  const width = Math.max(1, Math.round((image.naturalWidth || MAX_IMAGE_WIDTH) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || MAX_IMAGE_WIDTH) * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let output = canvas.toDataURL('image/jpeg', quality);
  while (output.length > MAX_DATA_URL_LENGTH && quality > 0.4) {
    quality -= 0.1;
    output = canvas.toDataURL('image/jpeg', quality);
  }
  if (output.length > MAX_DATA_URL_LENGTH) {
    throw new Error('Image bahut badi hai. Chhoti image chunein ya image URL use karein.');
  }
  return output;
}
