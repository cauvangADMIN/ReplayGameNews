import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

const s3=new S3Client({
region:"auto",
endpoint:process.env.R2_ENDPOINT,
credentials:{
accessKeyId:process.env.R2_ACCESS_KEY,
secretAccessKey:process.env.R2_SECRET_KEY
}
})

export default async function handler(req,res){

const data=await s3.send(new ListObjectsV2Command({
Bucket:process.env.R2_BUCKET
}))

const images=data.Contents.map(obj=>
`${process.env.R2_PUBLIC_URL}/${obj.Key}`
)

res.json(images)

}