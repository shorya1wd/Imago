import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Log EVERY time Cloudinary knocks, no matter what it says
        console.log(`\n🛎️ WEBHOOK KNOCK: Type -> ${body.notification_type}`);

        if (body.notification_type === 'eager') {
            const publicId = body.public_id;
            const optimizedVideo = body.eager?.find((file: { format: string; bytes: number }) => file.format === 'mp4');

            if (optimizedVideo && optimizedVideo.bytes) {
                await prisma.video.updateMany({
                    where: { publicId: publicId },
                    data: { compressedSize: String(optimizedVideo.bytes) }
                });
                console.log(`✅ DATABASE UPDATED! ${publicId} compressed to ${optimizedVideo.bytes} bytes`);
            } else {
                console.log("⚠️ Payload received, but couldn't find the 'mp4' bytes in the payload.");
            }
        }

        return NextResponse.json({ message: "Webhook received" }, { status: 200 });

    } catch (error) {
        console.error("❌ Cloudinary Webhook Crash:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}