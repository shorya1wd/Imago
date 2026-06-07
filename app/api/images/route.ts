import { NextRequest,NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name:process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

interface CloudinaryUploadResult{
    public_id:string,
    bytes:number,
    [key:string]:unknown
}

export async function POST(request:NextRequest){
    try {
        const {userId}=await auth()
        
        if(!userId){
            return NextResponse.json({error:"Not authorized"}, { status: 401 })
        }
    
        if(!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET){
            return NextResponse.json({error:"Cloudinary configuration missing"},{status:500})
        }
    
        const body=await request.json()
        const {base64Image,format}=body
    
        if (!base64Image) {
                return NextResponse.json({ error: "No image data provided" }, { status: 400 });
            }
    
        const uploadResponse=await new Promise<CloudinaryUploadResult>((resolve,reject)=>{
            cloudinary.uploader.upload(base64Image,{
                folder:"imago-saved-images",
            },(error,result)=>{
                if(error){
                    reject(error)
                }else{
                    resolve(result as CloudinaryUploadResult)
                }
            })
        })
        
    
        const savedImage=await prisma.image.create({
            data:{
                publicId:uploadResponse.public_id,
                format:format || "Unknown",
                size:String(uploadResponse.bytes),
                userId:userId
            }
        })
    
        return NextResponse.json(savedImage)
       
    } catch (error) {
        console.error("Error saving finalized image:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        // Fetch all images for this specific user, newest first
        const images = await prisma.image.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Not authorized" }, { status: 401 });
        }

        // Grab the ID from the URL query params (e.g., /api/images?id=123)
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Image ID is required" }, { status: 400 });
        }

        // 1. Find the image and ensure the logged-in user actually owns it
        const image = await prisma.image.findUnique({ where: { id } });
        
        if (!image) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 });
        }
        if (image.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 2. Destroy the asset in Cloudinary
        await cloudinary.uploader.destroy(image.publicId);

        // 3. Delete the record from your PostgreSQL database
        await prisma.image.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting image:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}