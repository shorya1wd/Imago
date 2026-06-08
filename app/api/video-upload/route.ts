import { NextRequest,NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import prisma from "../../../lib/prisma";



cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});

interface CloudinaryUploadResult {
    public_id: string;
    bytes:number;
    duration?:number;
    [key:string]:unknown;
}

export async function POST(request:NextRequest){
    
    try {
        const {userId}=await auth()

        if(!userId){
            return NextResponse.json({error:"Unauthorized"},{status:401})
        }

        if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
            return NextResponse.json({error:"Cloudinary configuration missing"},{status:500})
        }

        const body = await request.json();
        console.log("arrived body:",body)

 let actualCompressedSize = body.originalSize; // Fallback
        try {
            const resource = await cloudinary.api.resource(body.publicId, { resource_type: "video" });
            actualCompressedSize = resource.bytes;
        } catch (e) {
            console.warn("Could not fetch exact size from Cloudinary, using original:", e);
        }
        
        const video=await prisma.video.create({
            data:{
                publicId:body.publicId,
                originalSize:String(body.originalSize),
                compressedSize:String(actualCompressedSize),
                duration:body.duration || 0,
                title:body.title || "Untitled",
                description:body.description,
                userId:userId
            }
        })

        return NextResponse.json(video)

    } catch (error) {
        console.error("Error uploading video:", error);
        return NextResponse.json({error:"Internal Server Error"},{status:500})
    }
}
