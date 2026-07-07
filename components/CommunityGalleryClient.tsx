"use client"
import { useState } from "react";
import { CldImage, getCldImageUrl } from "next-cloudinary";
import { Globe, Clock, FileText, Download, Maximize2 } from "lucide-react"
import Link from "next/link";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { filesize } from "filesize";

dayjs.extend(relativeTime);

interface PublicImage {
  id: string;
  publicId: string;
  format: string;
  size: string | number;
  createdAt: Date;
}

interface Props {
  initialImages: PublicImage[];
}

export default function CommunityGalleryClient({ initialImages }: Props) {
  const [images] = useState<PublicImage[]>(initialImages);
  const [previewImage, setPreviewImage] = useState<PublicImage | null>(null);

  const formatBytes = (bytesValue: string | number) => {
    const bytes = typeof bytesValue === 'string' ? parseInt(bytesValue) : bytesValue;
    if (!bytes || bytes === 0) return '0 Bytes';
    return filesize(bytes);
  };

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
                    <span>{dayjs(img.createdAt).fromNow()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>{formatBytes(img.size as string)}</span>
                  </div>
                </div>

                {/* Download Button matching your Video UI */}
              <div className="card-actions mt-auto">
                  <a 
                    href={(() => {
                      const safeName = `imago-creation-${img.id.slice(-6)}`;
                      const fullUrl = getCldImageUrl({ src: img.publicId });
                      const baseUrl = fullUrl.split('/upload/')[0];
                      
                      // Safety Check: If the format is a long word like "Thumbnail", force it to "png"
                      const validExt = (img.format && img.format.length <= 4) ? img.format.toLowerCase() : 'png';
                      
                      return `${baseUrl}/upload/fl_attachment:${safeName}/${img.publicId}.${validExt}`;
                    })()}
                    target="_blank" 
                    rel="noopener noreferrer"
                    download={(() => {
                      // Same safety check for the actual downloaded file name
                      const validExt = (img.format && img.format.length <= 4) ? img.format.toLowerCase() : 'png';
                      return `imago-creation-${img.id.slice(-6)}.${validExt}`;
                    })()}
                    className="btn btn-primary w-full gap-2 font-semibold"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download size={18} />
                    Download
                  </a>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}
      
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

    </div>
  );
}
