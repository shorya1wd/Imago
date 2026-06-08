"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { CldImage,getCldImageUrl } from "next-cloudinary";
import { Globe, Loader2, Clock, FileText, Download,Maximize2 } from "lucide-react"
import Link from "next/link";
import { toast } from "sonner";

interface PublicImage {
  id: string;
  publicId: string;
  format: string;
  size: string | number;
  createdAt: string;
}

export default function CommunityGallery() {
  const [images, setImages] = useState<PublicImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<PublicImage | null>(null);

  useEffect(() => {
    // Fetching from our new public endpoint!
    axios.get("/api/images/public")
      .then((res) => setImages(res.data))
      .catch((err) => console.error("Failed to fetch community images", err))
      .finally(() => setIsLoading(false));
  }, []);

  const formatBytes = (bytesValue: string | number) => {
    const bytes = typeof bytesValue === 'string' ? parseInt(bytesValue) : bytesValue;
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };


const handleDownload = (img: PublicImage) => {
    // 1. Instantly trigger the spinner
    setDownloadingId(img.id);
    
    try {
      // 2. Do the download calculation IMMEDIATELY (No timeout wrapper)
      const baseUrl = getCldImageUrl({ src: img.publicId });
      const downloadUrl = baseUrl.replace('/upload/', '/upload/fl_attachment/');
      
      const link = document.createElement("a");
      link.href = downloadUrl;
      document.body.appendChild(link);
      
      // 3. Fire the click synchronously so the browser trusts it
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to start download.");
    }

    // 4. Reset the button state after 1 second just for a nice UI effect
    setTimeout(() => {
      setDownloadingId(null);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl mt-8">
      
      {/* ◄ Header Section ► */}
      <div className="flex justify-between items-end mb-10 pb-6 border-b border-base-200">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="text-primary w-8 h-8" />
            <h1 className="text-4xl font-bold tracking-tight text-base-content">Discover</h1>
          </div>
          <p className="text-base-content/60">Explore what the IMAGO community is creating.</p>
        </div>
        <Link href="/social-share" className="btn btn-primary">
          Create Yours
        </Link>
      </div>

      {/* ◄ Community Grid ► */}
      {images.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2 text-base-content">It is quiet here...</h2>
          <p className="text-base-content/50">Be the first to share an image with the community!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {images.map((img) => (
            <div key={img.id} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              
              {/* Image Preview */}
              <div className="relative w-full aspect-square bg-base-300 flex items-center justify-center overflow-hidden cursor-pointer group/preview" onClick={() => setPreviewImage(img)}>
                <CldImage
                  src={img.publicId}
                  alt={`Community creation`}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                   <Maximize2 className="text-white w-10 h-10 drop-shadow-lg" />
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="badge badge-primary font-bold uppercase">{img.format}</div>
                </div>
              </div>

              {/* ◄ NEW: Card Body with Metadata & Download ► */}
              <div className="card-body p-4 bg-base-100">
                
                {/* Metadata List */}
                <div className="space-y-2 mb-4 text-sm text-base-content/60">
                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{formatTimeAgo(img.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{formatBytes(img.size)}</span>
                  </div>
                </div>

                {/* Download Button matching your Video UI */}
                <div className="card-actions mt-auto">
                  {images.map((img) => {
          // Pre-calculate the forced-download URL here
          const baseUrl = getCldImageUrl({ src: img.publicId });
          const downloadUrl = baseUrl.replace('/upload/', '/upload/fl_attachment/');

          return (
            <div key={img.id} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group hover:shadow-2xl transition-all duration-300">
              
              {/* ... [KEEP ALL YOUR IMAGE PREVIEW CODE THE SAME] ... */}

              <div className="card-body p-4 bg-base-100">
                
                {/* ... [KEEP YOUR METADATA LIST THE SAME] ... */}

                {/* ◄ THE NEW BUTTON ► */}
                <div className="card-actions mt-auto">
                  <a 
                    href={downloadUrl}
                    className="btn btn-success w-full gap-2 font-semibold"
                  >
                    <Download size={18} />
                    Download
                  </a>
                </div>
                
              </div>
            </div>
          );
        })}
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
      {/* ... End of your grid ... */}
      
      {/* ◄ THE LIGHTBOX MODAL ► */}
      <dialog className={`modal ${previewImage ? 'modal-open' : ''}`}>
        <div className="modal-box max-w-5xl p-0 overflow-hidden bg-transparent shadow-none">
          
          {/* Close Button */}
          <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 z-50 bg-black/50 text-white hover:bg-black/80 border-none"
            onClick={() => setPreviewImage(null)}
          >
            ✕
          </button>

          {/* Full Image */}
          {previewImage && (
            <div className="relative w-full h-[80vh] flex items-center justify-center bg-base-300/90 rounded-2xl overflow-hidden backdrop-blur-sm border border-base-200">
              <CldImage
                src={previewImage.publicId}
                alt="Full preview"
                fill
                className="object-contain"
                sizes="100vw"
                priority // Ensures the modal image loads immediately
              />
            </div>
          )}
        </div>
        
        {/* Clicking the backdrop closes the modal */}
        <form method="dialog" className="modal-backdrop bg-black/80 backdrop-blur-sm">
          <button onClick={() => setPreviewImage(null)}>close</button>
        </form>
      </dialog>

    </div> // ◄ This is the final closing div of your container
  );
}
   