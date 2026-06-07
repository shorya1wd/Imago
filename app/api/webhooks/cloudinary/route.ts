import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma";

interface CloudinaryEagerFile {
    format: string;
    bytes: number;
    [key: string]: unknown; // Tells TS there are other properties we don't care about right now
}


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Cloudinary sends different types of notifications. 
        // "eager" means the background transformations just finished.
        if (body.notification_type === 'eager') {
            const publicId = body.public_id;

           // Look through the generated files to find the optimized mp4
            const optimizedVideo = body.eager?.find((file: CloudinaryEagerFile) => file.format === 'mp4');
            if (optimizedVideo && optimizedVideo.bytes) {
                // Update the database with the real compressed size!
                await prisma.video.updateMany({
                    where: { publicId: publicId },
                    data: { compressedSize: String(optimizedVideo.bytes) }
                });
                
                console.log(`✅ Webhook Success: Updated ${publicId} to ${optimizedVideo.bytes} bytes`);
            }
        }

        // Always return a 200 OK quickly so Cloudinary knows you received it
        return NextResponse.json({ message: "Webhook received" }, { status: 200 });

    } catch (error) {
        console.error("❌ Cloudinary Webhook Error:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}