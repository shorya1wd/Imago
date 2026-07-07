import React, { useState, useCallback ,useEffect} from 'react'
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, RefreshCw } from "lucide-react"
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from "filesize"
import { Video } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import axios from 'axios'
import { toast } from 'sonner'

dayjs.extend(relativeTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
    const router = useRouter();

    const [currentVideo, setCurrentVideo] = useState<Video>(video);
    
    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isMobile, setIsMobile] = useState(true);
    
    const originalSize = parseInt(currentVideo.originalSize);
    const compressedSize = parseInt(currentVideo.compressedSize);
    const isProcessing = originalSize === compressedSize; 
    const savedPercent = isProcessing ? 0 : ((originalSize - compressedSize) / originalSize) * 100;

    const downloadUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto,f_mp4/fl_attachment/${currentVideo.publicId}.mp4`;

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(!window.matchMedia("(pointer: fine)").matches);
        };
        checkMobile();
    }, []);

    useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(async () => {
        try {
            const response = await axios.post('/api/videos/sync', { id: currentVideo.id });
            if (response.data.compressedSize !== currentVideo.compressedSize) {
                setCurrentVideo(response.data);
            }
        } catch (error) {
            console.error("Auto-sync failed");
        }
    }, 5000);

    return () => clearInterval(interval);
}, [isProcessing, currentVideo.id, currentVideo.compressedSize]);

    // --- Media URL Generators ---
    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId, width: 400, height: 225, crop: "fill", gravity: "auto", assetType: "video", quality: "auto", format: "webp"
        })
    }, [])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId, width: 400, height: 225, rawTransformations: ["e_preview:duration_3:max_seg_3:min_seg_dur_1"]
        })
    }, [])

    const formatSize = useCallback((size: number) => filesize(size), []);
    
    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const handleSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSyncing(true);
        try {
            const response = await axios.post('/api/videos/sync', { id: currentVideo.id });
            
            if (response.data.compressedSize !== currentVideo.compressedSize) {
                setCurrentVideo(response.data);
            } 
        } catch (error) {
            toast.error("Failed to sync data.");
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div 
            className="card bg-base-100 shadow-xl overflow-hidden relative group cursor-pointer"
            onMouseEnter={() => { setIsHovered(true); setPreviewError(false); }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/videos/${currentVideo.id}`)}
        >
            <figure className="relative aspect-video bg-base-200">
                {isHovered && !isMobile && !previewError ? (
                    <video 
                        src={getPreviewVideoUrl(currentVideo.publicId)}
                        autoPlay muted loop 
                        className="w-full h-full object-cover"
                        onError={() => setPreviewError(true)}
                    />
                ) : (
                    <Image
                        src={getThumbnailUrl(currentVideo.publicId)} 
                        alt={currentVideo.title} 
                        width={400} height={225}
                        className="w-full h-full object-cover"
                    />
                )}
                
                <div className="absolute bottom-2 right-2 text-base-content bg-base-100/80 px-2 py-1 text-xs rounded">
                    {formatDuration(currentVideo.duration)}
                </div>
            </figure>

            <div className="card-body p-4">
                <h2 className="card-title text-sm truncate text-base-content">{currentVideo.title}</h2>
                
                <div className="flex flex-col text-xs text-base-content/70 mt-2 space-y-1">
                    <span className="flex items-center gap-1">
                        <Clock size={14} /> {dayjs(currentVideo.createdAt).fromNow()}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileUp size={14} /> {formatSize(originalSize)} Original
                    </span>
                    
                    {isProcessing ? (
                        <div className="flex items-center gap-2 text-warning">
                            <span className="flex items-center gap-1 font-semibold animate-pulse">
                                <FileDown size={14} /> Processing...
                            </span>
                            <button 
                                onClick={handleSync} 
                                disabled={isSyncing}
                                className="btn btn-ghost btn-xs btn-circle hover:bg-warning/20 z-10 relative"
                                title="Check if compression is finished"
                            >
                                <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
                            </button>
                        </div>
                    ) : (
                        <span className="flex items-center gap-1 text-primary font-medium">
                            <FileDown size={14} /> {formatSize(compressedSize)} (-{savedPercent.toFixed(0)}%)
                        </span>
                    )}
                </div>

                <div className="card-actions justify-end mt-4">
                    <a 
                        href={isProcessing ? "#" : downloadUrl}
                        target={isProcessing ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        download={!isProcessing ?`${currentVideo.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4`: undefined}
                        className={`btn w-full gap-2 font-semibold ${isProcessing ? 'btn-disabled opacity-60 cursor-not-allowed' : 'btn-primary'}`}
                        onClick={(e) => {
                        e.stopPropagation();
                        if (isProcessing) {
                        e.preventDefault();
                        toast.info("Please wait! Cloudinary is still compressing this video.");
                        }
                        }}
                    >
                        <Download size={18} />
                        {isProcessing ? "Preparing Download..." : "Download"}
                    </a>
                </div>
            </div>
        </div>
    )
}

export default VideoCard