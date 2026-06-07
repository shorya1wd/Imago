import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';

cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

interface CloudinaryUploadResult {
    public_id: string;
    [key:string]:unknown;
}

export async function POST(request:NextRequest){
    const {userId}=await auth()

    try {
        const formData=await request.formData()
        const file=formData.get('file') as File | null

        if(!file){
            return NextResponse.json({error:"No file provided"},{status:400})
        }

        const bytes=await file.arrayBuffer()
        const buffer=Buffer.from(bytes)

        const result=await new Promise<CloudinaryUploadResult>((resolve,reject)=>{
            cloudinary.uploader.upload_stream(
                {folder:"next-cloudinary-uploads"},
                (error,result)=>{
                    if(error){
                        reject(error)
                    }else{
                        resolve(result as CloudinaryUploadResult)
                    }
                }
            ).end(buffer)
        })

        return NextResponse.json({public_id:result.public_id})

    } catch (error) {
        console.error("Error uploading image:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}
