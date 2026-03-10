import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY
  }
})

export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(req, res) {

  const chunks = []

  for await (const chunk of req)
    chunks.push(chunk)

  const buffer = Buffer.concat(chunks)

  const filename = Date.now() + ".jpg"

  await client.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: filename,
    Body: buffer,
    ContentType: "image/jpeg"
  }))

  const url =
    `https://pub-da217e9da43e4b3ba192844eb749f8ad.r2.dev/${filename}`

  res.status(200).json({ url })
}