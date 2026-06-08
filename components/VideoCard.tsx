import React,{useState,useCallback} from 'react'
import {getCldImageUrl,getCldVideoUrl} from "next-cloudinary"
import {Download,Clock,FileDown,FileUp} from "lucide-react"
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import {filesize} from "filesize"
import { Video } from '@prisma/client'
import {useRouter} from 'next/navigation'
import Image from 'next/image'

dayjs.extend(relativeTime)

interface VideoCardProps{
    video:Video;
    onDownload:(url:string,title:string) => void;
}

const VideoCard:React.FC<VideoCardProps> = ({video,onDownload}) => {

    const router = useRouter();

    const [isHovered,setIsHovered] = useState(false);
    const [previewError,setPreviewError] = useState(false);

    const getThumbnailUrl = useCallback((publicId:string) => {
        return getCldImageUrl({
            src:publicId,
            width:400,
            height:225,
            crop:"fill",
            gravity:"auto",
            assetType:"video",
            quality:"auto",
            format:"webp"
        })
    },[])

    const getFullVideoUrl = useCallback((publicId:string) => {
        return getCldVideoUrl({
            src:publicId,
            width:1920,
            height:1080
        })
    },[])

    const getPreviewVideoUrl = useCallback((publicId:string) => {
        return getCldVideoUrl({
            src:publicId,
            width:400,
            height:225,
            rawTransformations:["e_preview:duration_10:max_seg_7:min_seg_dur_1"]
        })
    },[])

    const formatSize = useCallback((size:number) => {
        return filesize(size);
    },[]);

    const formatDuration = useCallback((seconds:number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    },[]);

    const original = Number(video.originalSize) || 0;
    const compressed = Number(video.compressedSize) || 0;
    const compressionPercentage = original > 0 
    ? Math.round((1 - compressed / original) * 100) 
    : 0;



    const handlePreviewError = () => {
        setPreviewError(true)
    }

  return (
  <div 
      className="card bg-base-100 shadow-xl overflow-hidden relative group cursor-pointer"
      onMouseEnter={() => {
          setIsHovered(true);
          setPreviewError(false); // ◄ Replaces your useEffect!
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => router.push(`/videos/${video.id}`)}
  >
      <figure className="relative aspect-video bg-base-200">
          {/* If hovering and no error, show video. Otherwise show thumbnail. */}
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
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 text-base-content bg-base-100/80 px-2 py-1 text-xs rounded">
              {formatDuration(video.duration)}
          </div>
      </figure>

      <div className="card-body p-4">
          <h2 className="card-title text-sm truncate text-base-content">{video.title}</h2>
          
          <div className="flex flex-col text-xs text-base-content/70 mt-2 space-y-1">
              <span className="flex items-center gap-1"><Clock size={14} /> {dayjs(video.createdAt).fromNow()}</span>
              <span className="flex items-center gap-1"><FileUp size={14} /> {formatSize(Number(video.originalSize))}</span>
              <span className="flex items-center gap-1"><FileDown size={14} /> {formatSize(Number(video.compressedSize))} (-{compressionPercentage}%)</span>
          </div>

          <div className="card-actions justify-end mt-4">
                    <button 
                        className="btn btn-primary btn-sm z-10 relative"
                        onClick={(e) => {
                            e.stopPropagation(); // ◄ STOPS THE MODAL FROM OPENING WHEN DOWNLOADING
                            onDownload(getFullVideoUrl(video.publicId), video.title)
                        }}
                    >
                        <Download size={16} /> Download
                    </button>
                   <a 
          href={(() => {
            const safeTitle = video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();
            const fullUrl = getCldVideoUrl({ src: video.publicId, format: "mp4" });
            const baseUrl = fullUrl.split('/upload/')[0];
            
            return `${baseUrl}/upload/fl_attachment:${safeTitle}/${video.publicId}.mp4`;
          })()}
          target="_blank"
          rel="noopener noreferrer"
          download={`${video.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.mp4`}
          className="btn btn-success w-full gap-2 font-semibold"
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