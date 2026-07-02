import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import prisma from "../../../../lib/prisma";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

interface CloudinaryDerived {
    format?: string;
    transformation?: string;
    bytes: number;
}

export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json();
        
        const video = await prisma.video.findUnique({ where: { id } });
        if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

        const resource = await cloudinary.api.resource(video.publicId, { resource_type: "video" });

        let actualCompressedSize = String(resource.bytes);
        
        if (resource.derived && resource.derived.length > 0) {
            
            const mp4Files = resource.derived.filter((d: CloudinaryDerived) => d.format === "mp4");

            if (mp4Files.length > 0) {
                const largestMp4 = mp4Files.reduce((prev: CloudinaryDerived, current: CloudinaryDerived) => 
                    (prev.bytes > current.bytes) ? prev : current
                );
                actualCompressedSize = String(largestMp4.bytes);
                
            } else {
                actualCompressedSize = video.originalSize;
            }
        }
       if (actualCompressedSize !== video.originalSize && actualCompressedSize !== video.compressedSize) {
            const updatedVideo = await prisma.video.update({
                where: { id: video.id },
                data: { compressedSize: actualCompressedSize }
            });
            return NextResponse.json(updatedVideo);
        }
        return NextResponse.json(video); 

    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: "Failed to sync with Cloudinary" }, { status: 500 });
    }
}