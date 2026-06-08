"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import type { Video } from '@prisma/client'

import { getCldVideoUrl } from 'next-cloudinary'
import { Download, Clock, FileUp, FileDown, ArrowLeft, Trash2, RefreshCw } from 'lucide-react'
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from "filesize"
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs' 
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

dayjs.extend(relativeTime)

export default function VideoPage() {
  const { userId } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false);

  

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/videos/${params.id}`)
        setVideo(response.data)
      } catch (err) {
        setError("Failed to fetch video details")
      } finally {
        setIsLoading(false)
      }
    }
    if (params.id) fetchVideo()
  }, [params.id])

  useEffect(() => {
    // 1. If the video hasn't loaded yet, do nothing
    if (!video) return;

    // 2. Check if it is currently processing
    const isCurrentlyProcessing = video.originalSize === video.compressedSize;

    // 3. If it's already finished, we don't need to poll. Stop here.
    if (!isCurrentlyProcessing) return;

    // 4. Set up the 5-second interval
    const interval = setInterval(async () => {
      try {
        const response = await axios.post('/api/videos/sync', { id: video.id });
        
        // 5. If the size changed, Cloudinary is done! Update the UI.
        if (response.data.compressedSize !== video.compressedSize) {
          setVideo(response.data); // This instantly turns the UI green
          toast.success("Video compression complete!");
        }
      } catch (error) {
        console.error("Auto-sync failed in VideoPage");
      }
    }, 5000); // 5000ms = 5 seconds

    // 6. Cleanup: stop the interval if they navigate away or if it finishes
    return () => clearInterval(interval);
    
  }, [video]); // This tells React to re-evaluate whenever the 'video' state changes

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({ src: publicId, quality: "auto", format: "mp4"})
  }, [])

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/videos/${video?.id}`);
      router.push('/home');
    } catch (err) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete the video. Please try again later.")
      setIsDeleting(false);
    }
  };

  const handleSync = async () => {
  if (!video) return;
  setIsSyncing(true);
  try {
    const response = await axios.post('/api/videos/sync', { id: video.id });
    
    if (response.data.compressedSize !== video.compressedSize) {
      setVideo(response.data); // Updates the UI instantly!  
    } 
  } catch (error) {
    toast.error("Failed to sync data.");
  } finally {
    setIsSyncing(false);
  }
};

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (error || !video) return <div className="alert alert-error max-w-lg mx-auto mt-10"><span>{error || "Video not found"}</span></div>

  // 1. Calculate stats exactly once, safely after video has loaded
  const originalSize = parseInt(video.originalSize);
  const compressedSize = parseInt(video.compressedSize);
  const isProcessing = originalSize === compressedSize;
  const savedPercent = isProcessing ? 0 : ((originalSize - compressedSize) / originalSize) * 100;
  
  const downloadUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best/fl_attachment/${video.publicId}.mp4`;

  return (
    <div className="container mx-auto p-4 max-w-6xl mt-8">
      {/* Back Button */}
      <Link href="/home" className="btn btn-ghost mb-4 pl-0">
        <ArrowLeft size={20} /> Back to Gallery
      </Link>

      {/* Video Player Section */}
      <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video flex items-center justify-center mb-8">
        <video 
          src={getFullVideoUrl(video.publicId)}
          controls
          autoPlay
          className="w-full h-full object-contain"
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col md:flex-row justify-between gap-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-4 text-base-content">{video.title}</h1>
          <p className="text-lg text-base-content/80 whitespace-pre-wrap leading-relaxed">
            {video.description || "No description provided for this video."}
          </p>
        </div>

        {/* Stats Sidebar */}
        <div className="w-full md:w-80 bg-base-200 p-6 rounded-2xl h-fit">
          
          <a 
    href={isProcessing ? "#" : downloadUrl}
    target={isProcessing ? "_self" : "_blank"} 
    rel="noopener noreferrer"
    download={(!isProcessing && video) ? `${video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4` : undefined}
    className={`btn w-full mb-6 gap-2 ${isProcessing ? 'btn-disabled opacity-60 cursor-not-allowed' : 'btn-primary'}`}
    onClick={(e) => {
        if (isProcessing) {
            e.preventDefault(); // Prevents the dead page navigation!
            toast.info("Please wait! Cloudinary is still compressing this video.");
        }
    }}
>
    <Download size={20} /> 
    {isProcessing ? "Preparing Source..." : "Download Source"}
</a>

          {userId === video.userId && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn btn-error btn-outline w-full mb-6"
            >
              {isDeleting ? <span className="loading loading-spinner"></span> : <Trash2 size={20} />}
              {isDeleting ? "Deleting..." : "Delete Video"}
            </button>
          )}

          <div className="space-y-4 text-sm font-medium">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base-content/60"><Clock size={16} /> Uploaded</span>
              <span>{dayjs(video.createdAt).fromNow()}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base-content/60"><FileUp size={16} /> Original Size</span>
              <span>{filesize(originalSize)}</span>
            </div>

            {/* 2. Smart Status Toggle for the Sidebar */}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base-content/60"><FileDown size={16} /> Compressed</span>
              {isProcessing ? (
                <div className="flex items-center gap-2 text-warning">
                  <span className="font-semibold animate-pulse">Processing...</span>
                  <button 
  onClick={handleSync} 
  disabled={isSyncing}
  className="btn btn-ghost btn-xs btn-circle hover:bg-warning/20"
  title="Check if compression is finished"
>
  <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
</button>
                </div>
              ) : (
                <span className="text-success">{filesize(compressedSize)}</span>
              )}
            </div>

            <div className="divider my-2"></div>
            
            <div className={`flex items-center justify-between ${isProcessing ? 'text-base-content/50' : 'text-success'}`}>
              <span>Bandwidth Saved</span>
              <span className="font-bold">{savedPercent.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}