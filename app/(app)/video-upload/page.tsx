"use client"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import 'next-cloudinary/dist/cld-video-player.css'
import { CldUploadWidget, CldVideoPlayer } from "next-cloudinary"

function VideoUpload() {
  // We no longer store the physical file in React state
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  
  // We store the Cloudinary info after the direct upload finishes
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)
  const [videoOriginalSize, setVideoOriginalSize] = useState<number>(0)
  
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!uploadedVideoId) {
      toast.warning("Please upload a video first!")
      return
    }

    setIsSaving(true)
    try {
      // THE BIG CHANGE: We are sending JSON now, NOT a massive FormData file!
      const payload = {
        title: title,
        description: description,
        publicId: uploadedVideoId,      // Send the Cloudinary ID to save in the DB
        originalSize: videoOriginalSize // Send the byte size from Cloudinary
      }

      const response = await axios.post("/api/video-upload", payload)
      
      if (response.data) {
        toast.success("Video published successfully!")
        router.push("/") 
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong saving the details. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6 text-base-content">Upload New Video</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Video Title</span>
              </label>
              <input 
                type="text" 
                placeholder="My awesome video" 
                className="input input-bordered w-full focus:outline-none" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isSaving}
              />
            </div>

            {/* Description Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Description</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24 w-full focus:outline-none" 
                placeholder="What is this video about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSaving}
              ></textarea>
            </div>

            {/* DIRECT CLOUDINARY UPLOAD SECTION */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold">Video File</span>
              </label>
              
              {!uploadedVideoId ? (
                // Show the upload button if no video is uploaded yet
                <CldUploadWidget 
                  uploadPreset="imago_public_preset" // MAKE SURE THIS MATCHES YOUR CLOUDINARY PRESET
                  options={{
                    maxFiles: 1,
                    resourceType: "video",
                    clientAllowedFormats: ["mp4", "mov", "webm"],
                    maxFileSize: 70000000, // 70MB limit enforced by Cloudinary directly
                  }}
                  onSuccess={(result: any) => {
                    // Save the Cloudinary data to state
                    setUploadedVideoId(result?.info?.public_id)
                    setVideoOriginalSize(result?.info?.bytes)
                    toast.success("Video uploaded to cloud!")
                  }}
                  onError={() => {
                    toast.error("Video upload failed. Please try again.")
                  }}
                >
                  {({ open }) => {
                    return (
                      <button 
                        type="button"
                        className="btn btn-outline btn-primary w-full border-dashed border-2" 
                        onClick={() => open()}
                      >
                        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                        Click to Select Video
                      </button>
                    )
                  }}
                </CldUploadWidget>
              ) : (
                // Show the Video Player preview once uploaded
                <div className="rounded-xl overflow-hidden bg-black border border-base-300 relative">
                  <CldVideoPlayer
                    id="video-preview"
                    width="1920"
                    height="1080"
                    src={uploadedVideoId}
                    controls
                  />
                  <button 
                    type="button"
                    className="btn btn-sm btn-error absolute top-2 right-2 opacity-80 hover:opacity-100"
                    onClick={() => setUploadedVideoId(null)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button (Only saves data to DB now) */}
            <button 
              type="submit" 
              className="btn btn-primary w-full mt-4"
              disabled={isSaving || !uploadedVideoId}
            >
              {isSaving ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Saving Details...
                </>
              ) : (
                "Publish Video"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoUpload