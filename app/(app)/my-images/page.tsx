"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { CldImage } from "next-cloudinary";
import { Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface SavedImage {
  id: string;
  publicId: string;
  format: string;
  size: string;
  createdAt: string;
}

export default function ImageGallery() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get("/api/images");
        setImages(response.data);
      } catch (error) {
        console.error("Failed to fetch images", error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image permanently?")) return;
    
    setDeletingId(id);
    try {
      // Using query parameters for the DELETE request
      await axios.delete(`/api/images?id=${id}`); 
      setImages(images.filter(img => img.id !== id));
    } catch (error) {
      console.error("Failed to delete image", error);
      toast.error("Failed to delete image.")
    } finally {
      setDeletingId(null);
    }
  };

  // Quick helper to format raw bytes into readable KB/MB
  const formatBytes = (bytesStr: string) => {
    const bytes = parseInt(bytesStr);
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Studio Gallery</h1>
          <p className="text-base-content/60 mt-2">Manage your exported social media assets.</p>
        </div>
        <Link href="/social-share" className="btn btn-primary">
          Create New Post
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="card bg-base-200 border border-base-300 shadow-xl flex flex-col items-center justify-center p-16 text-center">
          <ImageIcon className="w-20 h-20 text-base-content/20 mb-4" />
          <h2 className="text-2xl font-bold">No images saved yet</h2>
          <p className="text-base-content/60 mt-2 max-w-md">
            Head over to the Imago Studio, apply your favorite AI filters, and click &quot;Save to Studio&quot; to build your gallery.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div key={img.id} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden group">
              
              {/* Image Preview Container */}
              <div className="relative w-full h-48 bg-base-300 flex items-center justify-center overflow-hidden">
                <CldImage
                  src={img.publicId}
                  alt={`Saved ${img.format} image`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Card Details */}
              <div className="card-body p-5">
                <div className="flex justify-between items-start mb-2">
                  <div className="badge badge-primary font-semibold">{img.format}</div>
                  <span className="text-xs text-base-content/50 font-medium">
                    {formatBytes(img.size)}
                  </span>
                </div>
                
                <p className="text-xs text-base-content/40 mb-4">
                  Saved on {new Date(img.createdAt).toLocaleDateString()}
                </p>

                <div className="card-actions justify-end mt-auto pt-2 border-t border-base-200">
                  <button 
                    onClick={() => handleDelete(img.id)}
                    disabled={deletingId === img.id}
                    className="btn btn-ghost text-error hover:bg-error/10 btn-sm"
                  >
                    {deletingId === img.id ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}