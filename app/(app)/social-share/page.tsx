"use client"
import {useState,useRef,useEffect} from "react"
import { CldImage, getCldImageUrl } from "next-cloudinary"
import Image from "next/image"
import axios from "axios";
import { useUser, SignInButton } from "@clerk/nextjs";
import { toast } from "sonner";
import { HexColorPicker } from "react-colorful";

const socialFormats= {
  "Instagram-Square(1:1)": {
    id: "square",
    label: "Square Post",
    platform: "Instagram",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  "Instagram-Portrait(4:5)": {
    id: "portrait",
    label: "Portrait Post",
    platform: "Instagram",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
  },
  "Story-Reel-Tiktok(9:16)": {
    id: "story-reel",
    label: "Story / Reel",
    platform: "IG / TikTok",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
  },
  "Twitter-Fb-Landscape(16:9)": {
    id: "landscape",
    label: "Landscape Post",
    platform: "Twitter / Facebook",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
  },
  "Youtube-Thumbnail(16:9)": {
    id: "thumbnail",
    label: "Thumbnail",
    platform: "YouTube",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
  },
  "Twitter-Header(3:1)": { 
    id: "twitter-header",
    label: "Twitter Header",
    platform: "Twitter",
    width: 1500, 
    height: 500, 
    aspectRatio: "3:1",
  },
  "Facebook-Cover(205:78)": { 
    id: "facebook-cover",
    label: "Facebook Cover",
    platform: "Facebook",
    width: 820, 
    height: 312, 
    aspectRatio: "205:78",
  }
};

type SocialFormat=keyof typeof socialFormats;

function SocialShare() {

  const [uploadedImage,setUploadedImage]=useState<string|null>(null)
  const { isLoaded, isSignedIn, user } = useUser()
  const [selectedFormat,setSelectedFormat]=useState<SocialFormat>("Instagram-Square(1:1)")
  const [isUploading,setIsUploading]=useState<boolean>(false)
  const [isTransforming,setIsTransforming]=useState<boolean>(false)
  const imageRef = useRef<HTMLImageElement>(null)
  const [showPicker, setShowPicker] = useState(false);

  const [isEnhanced, setIsEnhanced] = useState(false);
  const [isRemoveBg, setIsRemoveBg] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const [hasOverlay, setHasOverlay] = useState(false);
  const [filter, setFilter] = useState<"none" | "grayscale" | "sepia" | "blur" | "pixelateFaces" | "blurFaces" | "cartoonify" | "invert" | "oilPaint" | "vignette">("none");
  const [bgColor, setBgColor] = useState<string>("");
  const [debouncedBgColor, setDebouncedBgColor] = useState<string>("");
  const [originalFilename, setOriginalFilename] = useState<string>("image");

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
    
    // Restore state from localStorage if it exists (e.g., after Clerk OAuth redirect)
    const savedState = localStorage.getItem("imago_studio_state");
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.uploadedImage) setUploadedImage(state.uploadedImage);
        if (state.selectedFormat) setSelectedFormat(state.selectedFormat);
        if (state.isEnhanced !== undefined) setIsEnhanced(state.isEnhanced);
        if (state.isRemoveBg !== undefined) setIsRemoveBg(state.isRemoveBg);
        if (state.isRestored !== undefined) setIsRestored(state.isRestored);
        if (state.hasOverlay !== undefined) setHasOverlay(state.hasOverlay);
        if (state.filter) setFilter(state.filter);
        if (state.bgColor) setBgColor(state.bgColor);
        if (state.debouncedBgColor) setDebouncedBgColor(state.debouncedBgColor);
        if (state.originalFilename) setOriginalFilename(state.originalFilename);
      } catch (e) {
        console.error("Failed to restore studio state", e);
      }
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (uploadedImage) {
      const stateToSave = {
        uploadedImage,
        selectedFormat,
        isEnhanced,
        isRemoveBg,
        isRestored,
        hasOverlay,
        filter,
        bgColor,
        debouncedBgColor,
        originalFilename
      };
      localStorage.setItem("imago_studio_state", JSON.stringify(stateToSave));
    }
  }, [uploadedImage, selectedFormat, isEnhanced, isRemoveBg, isRestored, hasOverlay, filter, bgColor, debouncedBgColor, originalFilename]);

  useEffect(() => {
    if (!bgColor) return; 
    // Prevent infinite loading bug on state restore: if they are already identical, skip.
    if (bgColor === debouncedBgColor) return;

    const timer = setTimeout(() => {
      setDebouncedBgColor(bgColor);
      if (uploadedImage) {
        setIsTransforming(true);
      }
    }, 600); 
    return () => clearTimeout(timer);
  }, [bgColor, debouncedBgColor, uploadedImage]);

  const handleEffectChange = <T,>(setter: (val: T) => void, value: T) => {
  setter(value);
  if (uploadedImage) setIsTransforming(true);
};

  const handleFormatChange = (format: SocialFormat) => {
    setSelectedFormat(format);
    if (uploadedImage) {
      setIsTransforming(true);
    }
  };
  
  const handleFileUpload = async(event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if(!file) return;
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
    const safeName = nameWithoutExt.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    setOriginalFilename(safeName || "image");
    setIsUploading(true)
    const formData=new FormData();
    formData.append("file",file);
    
    try {
      const response = await axios.post("/api/image-upload",formData);
      if(!response.data.public_id){
        throw new Error("Failed to upload image")
      }
      const data=response.data
      setUploadedImage(data.public_id)
      setIsTransforming(true);
    } catch (error) {
      console.error(error);
    }finally{
      setIsUploading(false)
    }
  }

  const handleSaveToStudio = async () => {
  if (!imageRef.current) return;
  setIsTransforming(true);

  try {
    const response = await fetch(imageRef.current.src);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const img = new window.Image();
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        ctx.drawImage(img, 0, 0);

        if (hasOverlay) {
          const shortestSide = Math.min(canvas.width, canvas.height);
          const fontSize = Math.max(25, Math.floor(shortestSide * 0.05));
          const margin = Math.max(15, Math.floor(shortestSide * 0.04));

          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = "white";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillText("@Imago", canvas.width - margin, canvas.height - margin);
        }

        // ◄ THE MAGIC: Convert canvas to Base64 string ►
        const base64Image = canvas.toDataURL("image/png");

        // Send it to the new API route
        await axios.post("/api/images", {
          base64Image: base64Image,
          format: socialFormats[selectedFormat].label
        });

        toast.success("Successfully saved to your studio!");
        localStorage.removeItem("imago_studio_state");
      
      }
      setIsTransforming(false);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  } catch (error) {
    console.error("Failed to save:", error);
    toast.error("Failed to save image. Please try again.");
    setIsTransforming(false);
  }
};

  const handleDownload = () => {
  if(!imageRef.current) return;
  setIsTransforming(true); // Keep the spinner on while processing

  fetch(imageRef.current.src)
  .then((response) => response.blob())
  .then((blob) => {
    const url = URL.createObjectURL(blob);
    const img = document.createElement('img');
    
    img.onload = () => {
      // 1. Create an invisible HTML canvas
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // 2. Draw the Cloudinary image onto the canvas
        ctx.drawImage(img, 0, 0);

        // 3. If toggled, draw the Watermark perfectly in the corner
        if (hasOverlay) {
          const shortestSide = Math.min(canvas.width, canvas.height);
          const fontSize = Math.max(25, Math.floor(shortestSide * 0.05));
          const margin = Math.max(15, Math.floor(shortestSide * 0.04));

          ctx.font = `bold ${fontSize}px Arial`;
          ctx.fillStyle = "white";
          ctx.textAlign = "right";
          ctx.textBaseline = "bottom";

          // Add a drop shadow so it pops on light backgrounds
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Stamp it precisely using the exact canvas dimensions
          ctx.fillText("@Imago", canvas.width - margin, canvas.height - margin);
        }

        // 4. Download the final Canvas
        const finalUrl = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = finalUrl;
        const safeFormatId = socialFormats[selectedFormat].id;
// 2. Combine the original cleaned filename with the format!
        link.download = `${originalFilename}-${safeFormatId}.png`
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
      setIsTransforming(false);
    };
    img.src = url;
  })
  .catch((err) => {
    console.error(err);
    setIsTransforming(false);
  });
}
if (!isMounted) {
    // Returns a blank screen (or a loading spinner) for the split-second the server is rendering
    return null; 
  }

  type FilterType = "none" | "grayscale" | "sepia" | "blur" | "pixelateFaces" | "blurFaces" | "cartoonify" | "invert" | "oilPaint" | "vignette";

  const filterOptions: { id: FilterType; label: string }[] = [
    { id: "none", label: "Normal" },
    { id: "grayscale", label: "Grayscale" },
    { id: "sepia", label: "Sepia" },
    { id: "vignette", label: "Cinematic Vignette" },
    { id: "blur", label: "Blur Entire Image" },
    { id: "pixelateFaces", label: "Censor Faces (Pixelate)" },
    { id: "blurFaces", label: "Censor Faces (Blur)" },
    { id: "cartoonify", label: "Cartoonify AI" },
    { id: "oilPaint", label: "Oil Painting" },
    { id: "invert", label: "Invert Colors" },
  ];

 return (
    <div className="container mx-auto p-4 max-w-6xl mt-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-base-content">Imago Studio</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: CONTROLS (Takes up 5 columns out of 12) */}
        <div className="lg:col-span-5 space-y-6">

          {/* Upload Card */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-base-content">1. Upload Image</h2>
              <input 
                type="file" 
                className="file-input file-input-bordered w-full file-input-primary text-base-content" 
                onChange={handleFileUpload} 
                disabled={isUploading}
                accept="image/png, image/jpeg, image/webp, image/gif"
              />
              {isUploading && (
                <div className="flex items-center gap-2 mt-2 text-primary">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span className="text-sm">Uploading to cloud...</span>
                </div>
              )}
            </div>
          </div>

          {/* Format Card */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-base-content mb-2">2. Select Format</h2>
              <div className="flex flex-wrap gap-2">
                {Object.keys(socialFormats).map((key) => {
                  const formatKey = key as SocialFormat;
                  return (
                    <button
                      key={key}
                      onClick={() => handleFormatChange(formatKey)}
                      className={`btn btn-sm ${selectedFormat === formatKey ? "btn-primary" : "btn-outline"}`}
                    >
                      {socialFormats[formatKey].label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* NEW: Effects & AI Card */}
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-base-content mb-4">3. AI Effects & Filters</h2>
              
              <div className="space-y-4">
                {/* Toggles */}
                <div className="flex items-center justify-between">
                  <span className="label-text">Auto-Enhance (Lighting)</span>
                  <input type="checkbox" className="toggle toggle-primary" checked={isEnhanced} onChange={(e) => handleEffectChange(setIsEnhanced, e.target.checked)} />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="label-text">Remove Background (AI)</span>
                  <input type="checkbox" className="toggle toggle-primary" checked={isRemoveBg} onChange={(e) => handleEffectChange(setIsRemoveBg, e.target.checked)} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="label-text">Restore Quality (AI)</span>
                  <input type="checkbox" className="toggle toggle-primary" checked={isRestored} onChange={(e) => handleEffectChange(setIsRestored, e.target.checked)} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="label-text">Add &quot;Imago&quot; Overlay</span>
                  <input type="checkbox" className="toggle toggle-primary" checked={hasOverlay} onChange={(e) => setHasOverlay(e.target.checked)} />
                </div>

                <div className="divider my-2"></div>

                {/* Filters */}
                {/* Filters */}
                <div>
                  <span className="label-text block mb-2 text-sm font-semibold text-base-content">Color Filters</span>
                  
                  <div className="dropdown w-full">
                    {/* The "Fake" Select Button */}
                    <div 
                      tabIndex={0} 
                      role="button" 
                      className="select select-bordered select-sm w-full flex items-center justify-between text-base-content"
                    >
                      {filterOptions.find(opt => opt.id === filter)?.label || "Normal"}
                    </div>
                    
                    {/* The Custom Dropdown Menu */}
                    <ul 
                      tabIndex={0} 
                      className="dropdown-content z-50 menu p-2 shadow-2xl bg-base-200 border border-base-300 rounded-box w-full mt-2 max-h-60 overflow-y-auto"
                    >
                      {filterOptions.map((opt) => (
                        <li key={opt.id}>
                          <button 
                            type="button"
                            onClick={() => {
                              handleEffectChange(setFilter, opt.id);
                              // ◄ This forces the dropdown to close after clicking!
                              const elem = document.activeElement as HTMLElement;
                              if (elem) elem.blur();
                            }}
                            className={`py-2 text-sm mt-1 ${
                              filter === opt.id 
                                ? 'bg-primary text-primary-content hover:bg-primary/90' 
                                : 'text-base-content hover:bg-base-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                {/* Background Color (Disabled if Restore is active) */}
                {/* Background Color (Disabled if Restore is active) */}
                {isRemoveBg && (
  <div>
    <span className="label-text block mb-2 text-sm font-semibold text-base-content">Background Color</span>
    <div className="flex items-center gap-3">
      
      {/* ◄ NEW CUSTOM COLOR PICKER ► */}
      <div className="relative">
        <button
          type="button"
          className="w-12 h-12 border border-base-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-transform active:scale-95"
          style={{ backgroundColor: bgColor || "#ffffff" }}
          disabled={isRestored}
          onClick={() => setShowPicker(!showPicker)}
        />
        {showPicker && !isRestored && (
          <div className="absolute top-14 left-0 z-50 p-3 bg-base-200 rounded-xl shadow-2xl border border-base-300 w-[220px]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold text-base-content">Pick Color</span>
              <button 
                type="button"
                onClick={() => setShowPicker(false)} 
                className="btn btn-circle btn-ghost btn-xs"
              >
                ✕
              </button>
            </div>
            <HexColorPicker color={bgColor || "#ffffff"} onChange={setBgColor} />
          </div>
        )}
      </div>
      {/* ◄ END CUSTOM COLOR PICKER ► */}

      <div className="flex flex-col">
        <span className="text-sm font-mono text-base-content/80 uppercase">
          {bgColor || "Transparent"}
        </span>
        <span className="text-xs text-base-content/50">
          Click to pick color
        </span>
      </div>
    </div>
    
    {isRestored && (
      <p className="text-xs text-error mt-2 font-medium">
        *AI Restore active. Background color disabled.
      </p>
    )}
  </div>
)}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PREVIEW (Takes up 7 columns out of 12) */}
        <div className="lg:col-span-7 card bg-base-100 shadow-xl border border-base-200 min-h-[600px] flex flex-col">
          <div className="card-body flex flex-col h-full">
            <h2 className="card-title flex justify-between text-base-content">
              Live Preview
              {isTransforming && <span className="loading loading-spinner text-primary"></span>}
            </h2>

                <div
              className="flex-1 bg-base-200 rounded-box flex items-center justify-center overflow-hidden relative mt-4 border border-base-300"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, rgba(128,128,128,0.15) 25%, transparent 25%), 
                  linear-gradient(-45deg, rgba(128,128,128,0.15) 25%, transparent 25%), 
                  linear-gradient(45deg, transparent 75%, rgba(128,128,128,0.15) 75%), 
                  linear-gradient(-45deg, transparent 75%, rgba(128,128,128,0.15) 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
              }}
            >
              {!uploadedImage ? (
                <p className="text-base-content/50 justify-center flex items-center">Upload an image to see preview</p>
              ) : (
                <div className="relative inline-block max-w-full max-h-full">
    {/*<CldImage
    
      key={`${selectedFormat}-${hasOverlay}-${isEnhanced}-${isRemoveBg}-${filter}`}
      ref={imageRef}
      src={uploadedImage}
      width={socialFormats[selectedFormat].width}
      height={socialFormats[selectedFormat].height}
      crop="fill"
      gravity="auto"
      format={isRemoveBg && !isRestored ? "png" : "auto"}
      
      improve={isEnhanced ? true : undefined}
      removeBackground={isRemoveBg ? true : undefined}
      restore={isRestored ? true : undefined}
      
      grayscale={filter === "grayscale"}
      sepia={filter === "sepia"}
      blur={filter === "blur" ? "800" : undefined}
      pixelateFaces={filter === "pixelateFaces" ? "20" : undefined} 
      blurFaces={filter === "blurFaces" ? "800" : undefined}
      cartoonify={filter === "cartoonify" ? true : undefined}
      negate={filter === "invert" ? true : undefined}
      oilPaint={filter === "oilPaint" ? "40" : undefined}
      vignette={filter === "vignette" ? "50" : undefined}
      
      background={isRemoveBg && debouncedBgColor ? debouncedBgColor.replace("#", "rgb:") : undefined}
      
      // ◄ REMOVED: No more broken Cloudinary overlays!

      alt="Social Media Preview"
      className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300"
      style={{ opacity: isTransforming ? 0.3 : 1 }}
      onLoad={() => setIsTransforming(false)}
      onError={() => {
        setIsTransforming(false);
        toast.error("Failed to apply transformation")
      }}
    />
    */}
    {/* We generate the exact Cloudinary URL ourselves, overriding Next.js */}
<Image
  ref={imageRef}
  crossOrigin="anonymous" 
  src={getCldImageUrl({
    src: uploadedImage,
    width: socialFormats[selectedFormat].width,
    height: socialFormats[selectedFormat].height,
    crop: "fill",
    gravity: "auto",
    format: "auto",
    improve: isEnhanced ? true : undefined,
    removeBackground: isRemoveBg ? true : undefined,
    restore: isRestored ? true : undefined,
    grayscale: filter === "grayscale",
    sepia: filter === "sepia",
    blur: filter === "blur" ? "800" : undefined,
    pixelateFaces: filter === "pixelateFaces" ? "20" : undefined,
    blurFaces: filter === "blurFaces" ? "800" : undefined,
    cartoonify: filter === "cartoonify" ? true : undefined,
    negate: filter === "invert" ? true : undefined,
    oilPaint: filter === "oilPaint" ? "40" : undefined,
    vignette: filter === "vignette" ? "50" : undefined,
    background: isRemoveBg && debouncedBgColor ? debouncedBgColor.replace("#", "rgb:") : undefined
  })}
  alt="Social Media Preview"
  width={socialFormats[selectedFormat].width}
  height={socialFormats[selectedFormat].height}
  className="max-w-full max-h-full object-contain rounded-lg shadow-lg transition-opacity duration-300"
  style={{ opacity: isTransforming ? 0.3 : 1 }}
  onLoad={() => {
    setIsTransforming(false);
  }}
  onError={() => {
    // Cloudinary AI transformations can take a few seconds and trigger a temporary error/redirect.
    // We wait 4 seconds to check if the image successfully loads on retry before showing the toast.
    setTimeout(() => {
      if (imageRef.current && (!imageRef.current.complete || imageRef.current.naturalWidth === 0)) {
        setIsTransforming(false);
        toast.error("Failed to apply transformation. Please try again.");
      }
    }, 4000);
  }}
/>

    {/* NEW: Pure HTML/CSS Visual Preview of the Watermark */}
    {hasOverlay && (
      <div 
        className="absolute bottom-[4%] right-[4%] text-white font-bold pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" 
        style={{ fontSize: 'clamp(12px, 3vw, 20px)', opacity: 0.9 }}
      >
        @Imago
      </div>
    )}
  </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
  {/* Download button - always visible */}
  <button 
    className="btn btn-success w-full"
    onClick={handleDownload}
    disabled={!uploadedImage || isTransforming}
  >
    {!uploadedImage ? "Waiting for image..." : "Download Transformed Image"}
  </button>

  {/* ◄ CONDITIONAL RENDERING ► */}
  {isLoaded && (
    isSignedIn ? (
      <button 
        className="btn btn-primary w-full"
        onClick={handleSaveToStudio}
        disabled={!uploadedImage || isTransforming}
      >
        {isTransforming ? <span className="loading loading-spinner loading-sm"></span> : "Save to Studio Gallery"}
      </button>
    ) : (
      <SignInButton mode="modal">
        <button className="btn btn-primary btn-outline w-full" disabled={!uploadedImage}>
          Sign in to Save to Studio
        </button>
      </SignInButton>
    )
  )}
</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialShare