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


  // ... keep your standard handleDownload function here ...
// The missing Download Handler!
  const handleDownload = useCallback((url: string, title: string) => {
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        
        const safeTitle = title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        link.setAttribute('download', `${safeTitle}.mp4`);
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      })
      .catch((err) => console.error("Download failed:", err));
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