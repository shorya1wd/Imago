import React from 'react'
import VideoCard from "../../../components/VideoCard"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"; // Ensure fresh data on each render

export default async function Home() {
  const videos = await prisma.video.findMany({
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="container mx-auto p-4 max-w-7xl mt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-base-content">Video Gallery</h1>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-base-200 rounded-box">
          <h2 className="text-xl font-semibold mb-2 text-base-content">No videos yet!</h2>
          <p className="text-base-content/70">Go to the upload page to add your first video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <VideoCard 
              key={video.id} 
              video={video} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
