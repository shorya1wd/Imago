import { NextResponse } from 'next/server'
import prisma from "../../../../lib/prisma"
import { auth } from '@clerk/nextjs/server' 

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id: id }
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    if (video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden: You cannot delete someone else's video." }, { status: 403 });
    }

    await prisma.video.delete({
      where: { id: id }
    });

    return NextResponse.json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error deleting video:", error);
    return NextResponse.json({ error: "Error deleting video" }, { status: 500 });
  }
}

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    
    const { id } = await params;

    const video = await prisma.video.findUnique({
      where: { id: id }
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error("Error fetching video:", error)
    return NextResponse.json({ error: "Error fetching video" }, { status: 500 })
  }
}

