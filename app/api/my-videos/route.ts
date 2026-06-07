import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch only videos where the userId matches the logged-in user
    const videos = await prisma.video.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(videos);
  } catch (error) {
    console.error("Error fetching user videos:", error);
    return NextResponse.json({ error: "Error fetching videos" }, { status: 500 });
  }
}