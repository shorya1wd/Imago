"use client"

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import type { Video } from '@prisma/client'
import VideoCard from "../../../components/VideoCard"



export default function MyVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)



  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/my-videos') // ◄ Hits the protected route!
        setVideos(response.data)
      } catch (err) {
        setError("Failed to fetch your videos")
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])
const handleDownload = useCallback(async (url: string, title: string) => {
    const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    try {
      // 1. Reverting to YOUR original Blob method. This guarantees exact file naming.
      const response = await fetch(url);
      if (!response.ok) throw new Error("Network response was not ok");
      
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${safeTitle}.mp4`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
      
    } catch (err) {
      console.error("Fetch failed, using native fallback:", err);
      // 2. ONLY if a laptop adblocker/CORS blocks the fetch: Native fallback that OPENS IN NEW TAB
      const fallbackUrl = url.includes('/upload/') ? url.replace('/upload/', `/upload/fl_attachment:${safeTitle}/`) : url;
      const fallbackLink = document.createElement('a');
      fallbackLink.href = fallbackUrl;
      fallbackLink.target = '_blank'; // CRITICAL: Stops the browser from navigating away and spinning at the top
      document.body.appendChild(fallbackLink);
      fallbackLink.click();
      document.body.removeChild(fallbackLink);
    }
  }, []);

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (error) return <div className="alert alert-error max-w-lg mx-auto mt-10"><span>{error}</span></div>

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
            <VideoCard key={video.id} video={video} onDownload={handleDownload} />
          ))}
        </div>
      )}
    </div>
  )
}