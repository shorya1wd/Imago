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
    try {
      // 1. Sanitize the title
      const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      
      // 2. Force Cloudinary's server to use YOUR filename
      // Format: /upload/fl_attachment:custom-filename/
      const downloadUrl = url.includes('/upload/') 
        ? url.replace('/upload/', `/upload/fl_attachment:${safeTitle}/`)
        : url;

      // 3. Fire the native download
      const link = document.createElement('a');
      link.href = downloadUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 4. THE SPINNER FIX: Give VideoCard an async Promise to resolve
      // This guarantees the spinner shuts off so you can click it again.
      await new Promise(resolve => setTimeout(resolve, 800));
      
    } catch (err) {
      console.error("Download failed:", err);
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