"use client"
import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import 'next-cloudinary/dist/cld-video-player.css'
import { CldUploadWidget, CldVideoPlayer } from "next-cloudinary";

const MAX_FILE_SIZE = 70 * 1024 * 1024

function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.warning("File is too large",{
        description: "Please select a video under 70MB.",
        duration:5000,
      })
      return
    }

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("description", description)
      formData.append("originalSize", file.size.toString())
      const response=await axios.post("/api/video-upload", formData)
      if (response.data) {
        router.push("/") 
      }
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong during upload. Please try again.")
    } finally {
      setIsUploading(false)
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
                <span className="label-text">Video Title</span>
              </label>
              <input 
                type="text" 
                placeholder="My awesome video" 
                className="input input-bordered w-full focus:outline-none" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                disabled={isUploading}
              />
            </div>

            {/* Description Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Description</span>
              </label>
              <textarea 
                className="textarea textarea-bordered h-24 w-full focus:outline-none" 
                placeholder="What is this video about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isUploading}
              ></textarea>
            </div>

            {/* File Upload Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text">Video File (Max 70MB)</span>
              </label>
              <input 
                type="file" 
                className="file-input file-input-bordered file-input-primary w-full" 
                accept="video/mp4, video/quicktime, video/webm"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
                disabled={isUploading}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn btn-primary w-full mt-4"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Processing & Compressing...
                </>
              ) : (
                "Upload Video"
              )}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}

export default VideoUpload
