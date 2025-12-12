import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  try {
    const key = relKey.replace(/^\/+/, ""); // Remove leading slashes
    const filePath = path.join(UPLOAD_DIR, key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let buffer =
      typeof data === "string"
        ? Buffer.from(data)
        : Buffer.isBuffer(data)
        ? data
        : Buffer.from(data);

    if (contentType.startsWith("image/")) {
      try {
        const pipeline = sharp(buffer, { failOnError: false }).rotate();
        if (contentType.includes("png")) {
          buffer = await pipeline.webp({ quality: 85 }).toBuffer();
        } else if (contentType.includes("jpeg") || contentType.includes("jpg")) {
          buffer = await pipeline.jpeg({ quality: 80 }).toBuffer();
        } else if (contentType.includes("webp")) {
          buffer = await pipeline.webp({ quality: 85 }).toBuffer();
        }
      } catch {}
    }

    await fs.promises.writeFile(filePath, buffer);

    // Assuming we serve static files from /uploads route
    const url = `/uploads/${key}`;

    return { key, url };
  } catch (error) {
    console.error("Storage upload failed:", error);
    throw new Error("Storage upload failed");
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string; }> {
  try {
    const key = relKey.replace(/^\/+/, "");
    const filePath = path.join(UPLOAD_DIR, key);

    if (!fs.existsSync(filePath)) {
      throw new Error("File not found");
    }

    const url = `/uploads/${key}`;

    return {
      key,
      url,
    };
  } catch (error) {
     console.error("Storage get failed:", error);
     throw new Error("Storage get failed");
  }
}
