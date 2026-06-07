import { NextRequest, NextResponse } from "next/server";

// Import the single, reusable connection from your lib folder
import prisma from "../../../lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Look how clean this is now!
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" }
    });
    
    return NextResponse.json(videos);
    
  } catch (error: unknown) {
    console.log(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
} 