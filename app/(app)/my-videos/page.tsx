import React from 'react'
import prisma from "@/lib/prisma"
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import VideoCard from "../../../components/VideoCard"

export const dynamic = "force-dynamic";

export default async function MyVideosPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const videos = await prisma.video.findMany({
    where: { userId: userId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">My Uploads</h1>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-base-200 rounded-box">
          <h2 className="text-xl font-semibold mb-2 text-base-content">You haven&apos;t uploaded anything yet!</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}