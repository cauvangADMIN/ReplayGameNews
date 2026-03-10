// api/upload.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import Busboy from "busboy";

/**
 * Required environment variables:
 * R2_ENDPOINT (e.g. https://<accountid>.r2.dev or custom endpoint)
 * R2_ACCESS_KEY
 * R2_SECRET_KEY
 * R2_BUCKET
 * R2_PUBLIC_URL (optional) - public base URL like https://pub-xxx.r2.dev
 */

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  },
  forcePathStyle: false,
});

export const config = {
  api: {
    bodyParser: false
  }
};

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const busboy = new Busboy({ headers: req.headers });
    const files = [];

    busboy.on('file', (fieldname, fileStream, filename, encoding, mimetype) => {
      const chunks = [];
      fileStream.on('data', (d) => chunks.push(d));
      fileStream.on('end', () => {
        const buffer = Buffer.concat(chunks);
        files.push({ fieldname, filename, encoding, mimetype, buffer, size: buffer.length });
      });
      fileStream.on('error', (err) => {
        console.error('file stream error', err);
        reject(err);
      });
    });

    busboy.on('error', (err) => {
      console.error('busboy error', err);
      reject(err);
    });

    busboy.on('finish', () => {
      resolve(files);
    });

    req.pipe(busboy);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const files = await parseMultipart(req);

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // We'll take the first file
    const file = files[0];
    const ext = file.filename && file.filename.includes('.') ? file.filename.split('.').pop() : 'bin';
    // build a unique key
    const key = `${Date.now()}-${Math.random().toString(36).slice(2,9)}.${ext}`;

    const putParams = {
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream',
    };

    await client.send(new PutObjectCommand(putParams));

    // Build public url if provided
    let publicUrl = null;
    if (process.env.R2_PUBLIC_URL) {
      // ensure no trailing slash
      const base = process.env.R2_PUBLIC_URL.replace(/\/$/, '');
      publicUrl = `${base}/${key}`;
    } else {
      // fallback to returning key and bucket so caller can build url
      publicUrl = `/${key}`;
    }

    // Return useful metadata
    res.status(200).json({
      path: publicUrl,
      key,
      size: file.size,
      mime: file.mimetype
    });

  } catch (err) {
    console.error('upload handler error', err);
    res.status(500).json({ error: (err && err.message) ? err.message : String(err) });
  }
}