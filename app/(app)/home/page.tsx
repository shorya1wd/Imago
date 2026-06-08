"use client"

import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Video } from '@prisma/client'
import VideoCard from "../../../components/VideoCard"

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)


  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('/api/videos')
        
        setVideos(response.data)
      } catch (err) {
        console.error(err)
        setError("Failed to fetch videos")
      } finally {
        setIsLoading(false)
      }
    }
    fetchVideos()
  }, [])
// The Download Handler: Injects Cloudinary's attachment flag to bypass CORS
  const handleDownload = useCallback((url: string, title: string) => {
    try {
      // 1. Inject the attachment flag right after '/upload/'
      // This tells Cloudinary to force a download instead of playing the video
      const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');

      // 2. Create the native HTML anchor tag
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      // Sanitize title for the fallback filename (though Cloudinary handles the main extension)
      const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
      link.setAttribute('download', `${safeTitle}.mp4`);
      
      // 3. Trigger the click synchronously (Immediate, no timeouts)
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-error max-w-lg mx-auto mt-10">
        <span>{error}</span>
      </div>
    )
  }

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
              onDownload={handleDownload} 
            />
          ))}
        </div>
      )}
    </div>
  )
}
