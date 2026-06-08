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
        
        // 1. Get the current video from DB
        const video = await prisma.video.findUnique({ where: { id } });
        if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });

        // 2. Ask Cloudinary for the latest status
        const resource = await cloudinary.api.resource(video.publicId, { resource_type: "video" });

        // 3. Find the new compressed size (Cloudinary puts background jobs in the "derived" array)
       // --- THE BULLETPROOF FIX ---
        let actualCompressedSize = String(resource.bytes);
        
        if (resource.derived && resource.derived.length > 0) {
            
            // 1. STRICTLY filter out everything that is not an MP4 video
            const mp4Files = resource.derived.filter((d: CloudinaryDerived) => d.format === "mp4");

            if (mp4Files.length > 0) {
                // 2. If it made multiple MP4s (e.g., the 10-second preview AND the full compressed video),
                // ALWAYS grab the largest one. The preview will be tiny, the real one will be MBs.
                const largestMp4 = mp4Files.reduce((prev: CloudinaryDerived, current: CloudinaryDerived) => 
                    (prev.bytes > current.bytes) ? prev : current
                );
                actualCompressedSize = String(largestMp4.bytes);
                
            } else {
                // 3. If there are NO mp4s ready yet, it's still processing. 
                // Force it to match the original size so your UI keeps showing "Processing..."
                actualCompressedSize = video.originalSize;
            }
        }
        // ---------------------------
        // 4. If Cloudinary has a smaller size now, update the database!
       if (actualCompressedSize !== video.originalSize && actualCompressedSize !== video.compressedSize) {
            const updatedVideo = await prisma.video.update({
                where: { id: video.id },
                data: { compressedSize: actualCompressedSize }
            });
            return NextResponse.json(updatedVideo);
        }
        // 5. If it's still the same size, it means Cloudinary is actually still processing
        return NextResponse.json(video); 

    } catch (error) {
        console.error("Sync Error:", error);
        return NextResponse.json({ error: "Failed to sync with Cloudinary" }, { status: 500 });
    }
}