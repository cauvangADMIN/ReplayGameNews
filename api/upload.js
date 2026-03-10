import Busboy from "busboy"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3=new S3Client({
region:"auto",
endpoint:process.env.R2_ENDPOINT,
credentials:{
accessKeyId:process.env.R2_ACCESS_KEY,
secretAccessKey:process.env.R2_SECRET_KEY
}
})

export const config={
api:{bodyParser:false}
}

export default async function handler(req,res){

if(req.method!=="POST"){

res.status(405).json({error:"method not allowed"})
return

}

const bb=Busboy({headers:req.headers})

let fileBuffer=[]
let filename=""
let mime=""

bb.on("file",(name,file,info)=>{

filename=info.filename
mime=info.mimeType

file.on("data",data=>fileBuffer.push(data))

})

bb.on("finish",async()=>{

const buffer=Buffer.concat(fileBuffer)

const ext=filename.split(".").pop()

const key=Date.now()+"-"+Math.random().toString(36).slice(2)+"."+ext

await s3.send(new PutObjectCommand({

Bucket:process.env.R2_BUCKET,
Key:key,
Body:buffer,
ContentType:mime

}))

const url=`${process.env.R2_PUBLIC_URL}/${key}`

res.status(200).json({path:url})

})

req.pipe(bb)

}