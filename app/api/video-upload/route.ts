import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@clerk/nextjs/server';
import prisma from "../../../lib/prisma";

cloudinary.config({ 
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        // 1. Force the original size to be a String no matter what
        const safeOriginalSize = String(body.originalSize || "0");
let safeCompressedSize = safeOriginalSize; 

try {
    // Ask Cloudinary for the REAL size
    const resource = await cloudinary.api.resource(body.publicId, { resource_type: "video" });
    if (resource && resource.bytes) {
        safeCompressedSize = String(resource.bytes);
    }
} catch (e) {
    console.log("Still processing, using temporary fallback.");
}
        // 4. Save to Database with guaranteed Strings
        const video = await prisma.video.create({
            data: {
                publicId: body.publicId,
                originalSize: safeOriginalSize,     // ◄ String
                compressedSize: safeCompressedSize, // ◄ String
                duration: body.duration || 0,
                title: body.title || "Untitled",
                description: body.description || "",
                userId: userId
            }
        });

        return NextResponse.json(video);

    } catch (error: any) {
        console.error("CRITICAL DATABASE ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}