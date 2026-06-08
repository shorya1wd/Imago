"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import type { Video } from '@prisma/client'

import { getCldVideoUrl } from 'next-cloudinary'
import { Download, Clock, FileUp, FileDown, ArrowLeft,Trash2 } from 'lucide-react'
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

  const getFullVideoUrl = useCallback((publicId: string) => {
    return getCldVideoUrl({ src: publicId,quality:"auto",format:"mp4"})
  }, [])

  const handleDownload = useCallback(() => {
    if (!video) return;
    const url = getFullVideoUrl(video.publicId);
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        const safeTitle = video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
        link.setAttribute('download', `${safeTitle}.mp4`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(objectUrl);
      });
  }, [video, getFullVideoUrl]);

  const handleDelete = async () => {
    // Standard browser confirmation dialog to prevent accidents
    if (!window.confirm("Are you sure you want to delete this video? This action cannot be undone.")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`/api/videos/${video?.id}`);
      router.push('/home'); // Send them back to the gallery!
    } catch (err) {
      console.error("Failed to delete video:", err);
      toast.error("Failed to delete the video.Please try again later.")
      setIsDeleting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><span className="loading loading-spinner loading-lg text-primary"></span></div>
  if (error || !video) return <div className="alert alert-error max-w-lg mx-auto mt-10"><span>{error || "Video not found"}</span></div>

  const compressionPercentage = Math.round((1 - Number(video.compressedSize) / Number(video.originalSize)) * 100);

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
          
          {/* Create the clean, raw URL directly inside the href */}
          <a 
            href={(() => {
              if (!video) return "#";
              const safeTitle = video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
              const fullUrl = getFullVideoUrl(video.publicId); 
              
              // Extract base domain
              const baseUrl = fullUrl.split('/upload/')[0]; 
              
              // Rebuild raw URL to bypass the rendering engine entirely
              return `${baseUrl}/upload/fl_attachment:${safeTitle}/${video.publicId}.mp4`;
            })()}
            target="_blank" 
            rel="noopener noreferrer"
            download={video ? `${video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4` : "download.mp4"}
            className="btn btn-primary w-full mb-6"
          >
            <Download size={20} /> Download Source
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
              <span>{filesize(Number(video.originalSize))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-base-content/60"><FileDown size={16} /> Compressed Size</span>
              <span className="text-success">{filesize(Number(video.compressedSize))}</span>
            </div>
            <div className="divider my-2"></div>
            <div className="flex items-center justify-between text-success">
              <span>Bandwidth Saved</span>
              <span className="font-bold">{compressionPercentage}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}