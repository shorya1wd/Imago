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
        let actualCompressedSize = String(resource.bytes);

        if (resource.derived && resource.derived.length > 0) {
            
            // 2. Use our new 'CloudinaryDerived' type instead of 'any' or 'unknown'
            const videoDerived = resource.derived.find((d: CloudinaryDerived) => 
                d.format === "mp4" || (d.transformation && d.transformation.includes("q_auto"))
            );

            if (videoDerived) {
                actualCompressedSize = String(videoDerived.bytes);
            } else {
                // 3. Use it in the reduce function too!
                const largestDerived = resource.derived.reduce((prev: CloudinaryDerived, current: CloudinaryDerived) => 
                    (prev.bytes > current.bytes) ? prev : current
                );
                actualCompressedSize = String(largestDerived.bytes);
            }
        }
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