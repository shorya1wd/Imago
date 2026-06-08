"use client"
import { useRef, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import 'next-cloudinary/dist/cld-video-player.css'
import { CldUploadWidget, CldVideoPlayer } from "next-cloudinary";

const MAX_FILE_SIZE = 100 * 1024 * 1024

function VideoUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const titleRef = useRef("");
const descRef = useRef("");

  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      toast.warning("File is too large",{
        description: "Please select a video under 100MB.",
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
      const response=await axios.post("/api/video-upload", formData,{
        timeout: 300000, // 5 minutes (in milliseconds)
        headers: {
          "Content-Type": "multipart/form-data",
        }
      })
      if (response.data) {
        router.push("/") 
      }
    } catch (error:any) {
    console.error("Upload error details:", error.response?.data || error.message)
      toast.error("Something went wrong during upload. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSuccess = async (result: any) => {
    setIsUploading(true);
    console.log("Cloudinary Success Data:", result.info);
    const info = result.info;
    const derived = info.derived?.[0];
    try {
      // ◄ Now we just send the ID, not the 77MB file!
      await axios.post("/api/video-upload", {
        publicId: result.info.public_id,
        title:titleRef.current || "Untitled",
        description:descRef.current || "",
        duration: result.info.duration,
        originalSize: result.info.bytes,
        compressedSize: derived ? derived.bytes : info.bytes
      });
      toast.success("Video uploaded successfully!");
      router.push("/");
    } catch (error:any) {
      if (error.response) {
        console.error("Server responded with error:", error.response.data);
        toast.error(`Server Error: ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
        toast.error("No response from server. Check Nginx/PM2 logs.");
      } else {
        console.error("Axios setup error:", error.message);
      }
    } finally {
      setIsUploading(false);
    }
  };


 return (
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Upload New Video</h2>
          
          {/* Inputs for Title and Description */}
          <input type="text" className="input input-bordered w-full" placeholder="Title" value={title} onChange={(e) => {setTitle(e.target.value); titleRef.current = e.target.value}} />
          <textarea className="textarea textarea-bordered w-full" placeholder="Description" value={description} onChange={(e) => {setDescription(e.target.value); descRef.current = e.target.value}} />

          {/* ◄ The Widget Replaces the <input type="file" /> */}
          <CldUploadWidget 
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            options={{ 
              resourceType: "video",
            }}
            onSuccess={handleSuccess}
          >
            {({ open }) => (
              <button 
                type="button" 
                className="btn btn-primary w-full mt-4" 
                onClick={() => open()}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Select & Upload Video"}
              </button>
            )}
          </CldUploadWidget>
        </div>
      </div>
    </div>
  );
}
export default VideoUpload
