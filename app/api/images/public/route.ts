import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch the 50 most recent images from ALL users
        const images = await prisma.image.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50, // Best practice: limit the payload so the database doesn't crash if you get huge!
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error("Error fetching public images:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}