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

        // 1. Receive the lightweight JSON payload instead of a massive FormData file
        const body = await request.json();
        const { title, description, publicId, originalSize } = body;

        if (!publicId) {
            return NextResponse.json({ error: "Missing Cloudinary Video ID" }, { status: 400 });
        }

        // 2. Ask Cloudinary for the video's exact duration and compressed size
        // (Since it was already uploaded from the frontend!)
        let duration = 0;
        let compressedSize = String(originalSize);

        try {
            const videoDetails = await cloudinary.api.resource(publicId, { resource_type: 'video' });
            duration = videoDetails.duration || 0;
            compressedSize = String(videoDetails.bytes || originalSize);
        } catch (cloudError) {
            console.error("Could not fetch video details from Cloudinary:", cloudError);
        }

        // 3. Save the final data to your Prisma Database
        const video = await prisma.video.create({
            data: {
                publicId: publicId,
                originalSize: String(originalSize),
                compressedSize: compressedSize,
                duration: duration,
                title: title,
                description: description,
                userId: userId
            }
        });

        return NextResponse.json(video);

    } catch (error) {
        console.error("Error saving video details:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}