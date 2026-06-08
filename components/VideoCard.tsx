import React, { useState, useCallback } from 'react'
import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary"
import { Download, Clock, FileDown, FileUp, RefreshCw } from "lucide-react"
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { filesize } from "filesize"
import { Video } from '@prisma/client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

dayjs.extend(relativeTime)

interface VideoCardProps {
    video: Video;
    onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {

    const router = useRouter();

    const [isHovered, setIsHovered] = useState(false);
    const [previewError, setPreviewError] = useState(false);
    
    // 1. Calculate the sizes and status exactly once
    const originalSize = parseInt(video.originalSize);
    const compressedSize = parseInt(video.compressedSize);
    const isProcessing = originalSize === compressedSize; 
    const savedPercent = isProcessing ? 0 : ((originalSize - compressedSize) / originalSize) * 100;

    const downloadUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/q_auto:best,f_auto/fl_attachment/${video.publicId}.mp4`;

    const getThumbnailUrl = useCallback((publicId: string) => {
        return getCldImageUrl({
            src: publicId,
            width: 400,
            height: 225,
            crop: "fill",
            gravity: "auto",
            assetType: "video",
            quality: "auto",
            format: "webp"
        })
    }, [])

    const getPreviewVideoUrl = useCallback((publicId: string) => {
        return getCldVideoUrl({
            src: publicId,
            width: 400,
            height: 225,
            rawTransformations: ["e_preview:duration_10:max_seg_7:min_seg_dur_1"]
        })
    }, [])

    const formatSize = useCallback((size: number) => {
        return filesize(size);
    }, []);

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }, []);

    const handlePreviewError = () => {
        setPreviewError(true)
    }

    return (
        <div 
            className="card bg-base-100 shadow-xl overflow-hidden relative group cursor-pointer"
            onMouseEnter={() => {
                setIsHovered(true);
                setPreviewError(false);
            }}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => router.push(`/videos/${video.id}`)}
        >
            <figure className="relative aspect-video bg-base-200">
                {isHovered && !previewError ? (
                    <video 
                        src={getPreviewVideoUrl(video.publicId)}
                        autoPlay 
                        muted 
                        loop 
                        className="w-full h-full object-cover"
                        onError={handlePreviewError}
                    />
                ) : (
                    <Image
                        src={getThumbnailUrl(video.publicId)} 
                        alt={video.title} 
                        width={400}
                        height={225}
                        className="w-full h-full object-cover"
                    />
                )}
                
                <div className="absolute bottom-2 right-2 text-base-content bg-base-100/80 px-2 py-1 text-xs rounded">
                    {formatDuration(video.duration)}
                </div>
            </figure>

            <div className="card-body p-4">
                <h2 className="card-title text-sm truncate text-base-content">{video.title}</h2>
                
                <div className="flex flex-col text-xs text-base-content/70 mt-2 space-y-1">
                    <span className="flex items-center gap-1">
                        <Clock size={14} /> {dayjs(video.createdAt).fromNow()}
                    </span>
                    <span className="flex items-center gap-1">
                        <FileUp size={14} /> {formatSize(originalSize)} Original
                    </span>
                    
                    {/* 2. The Smart Status Toggle */}
                    {isProcessing ? (
                        <div className="flex items-center gap-2 text-warning">
                            <span className="flex items-center gap-1 font-semibold animate-pulse">
                                <FileDown size={14} /> Processing...
                            </span>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevents routing to the video page
                                    window.location.reload(); 
                                }} 
                                className="btn btn-ghost btn-xs btn-circle hover:bg-warning/20"
                                title="Check if compression is finished"
                            >
                                <RefreshCw size={14} />
                            </button>
                        </div>
                    ) : (
                        <span className="flex items-center gap-1 text-success font-medium">
                            <FileDown size={14} /> {formatSize(compressedSize)} (-{savedPercent.toFixed(0)}%)
                        </span>
                    )}
                </div>

                <div className="card-actions justify-end mt-4">
                    {/* 3. The Unblocked Download Button */}
                    <a 
                        href={downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={`${video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4`}
                        className="btn btn-success w-full gap-2 font-semibold"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={18} />
                        Download
                    </a>
                </div>
            </div>
        </div>
    )
}

export default VideoCard