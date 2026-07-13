import React from "react";
import { User, Mail, Globe, Code, Layers, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto p-6 lg:p-12 max-w-4xl">
      
      {/* Header */}
      <div className="mb-10 border-b border-base-300 pb-8">
        <h1 className="text-4xl font-black text-primary mb-4 tracking-tight">About Imago</h1>
        <p className="text-xl text-base-content/80 font-medium">
          An AI-powered media sharing and editing platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Left Column: Project Details */}
        <div className="space-y-8">
          <div className="card bg-base-200 border border-base-300 shadow-sm p-6 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Layers className="text-primary" size={24} /> 
              Project Details
            </h2>
            <p className="text-base-content/80 leading-relaxed">
              Imago is a high-performance, full-stack media platform designed to streamline how users upload, optimize, and edit images and videos. By integrating seamless background compression and AI-driven transformations, Imago provides a professional-grade media studio directly in the browser.
            </p>
          </div>

          <div className="card bg-base-200 border border-base-300 shadow-sm p-6 rounded-3xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <Zap className="text-warning fill-warning/20" size={24} /> 
              Key Features
            </h2>
            <ul className="space-y-3 text-base-content/80">
              <li className="flex gap-2">
                <span className="text-primary font-bold">✓</span> 
                <span><strong>Asynchronous Video Processing:</strong> Real-time background compression for massive files without locking the browser.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">✓</span> 
                <span><strong>AI-Powered Image Studio:</strong> Advanced editing tools including background removal and generative color replacement.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">✓</span> 
                <span><strong>Frictionless Delivery:</strong> Automated hover-previews and optimized download links drastically reducing bandwidth.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Developer Info */}
        <div className="space-y-6">
          <div className="card bg-primary text-primary-content shadow-lg p-8 rounded-3xl relative overflow-hidden">
            {/* Background design elements */}
            <div className="absolute -top-10 -right-10 opacity-10">
              <Code size={120} />
            </div>
            
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2 relative z-10">
              <User size={24} className="stroke-[3]" /> 
              Developer Info
            </h2>
            
            <div className="space-y-6 relative z-10 font-medium">
              <div>
                <p className="text-primary-content/70 text-sm uppercase tracking-widest font-bold mb-1">Built By</p>
                <p className="text-xl">Shorya Bhushan</p>
                <p className="text-sm opacity-90">Full Stack Developer / Engineer</p>
              </div>
              
              <div>
                <p className="text-primary-content/70 text-sm uppercase tracking-widest font-bold mb-1">Contact</p>
                <a href="mailto:shoryabhushan0@gmail.com" className="flex items-center gap-2 hover:opacity-75 transition-opacity">
                  <Mail size={18} /> shoryabhushan0@gmail.com
                </a>
              </div>
              
              <div>
                <p className="text-primary-content/70 text-sm uppercase tracking-widest font-bold mb-1">Portfolio</p>
                <a href="https://shoryabhushan.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:opacity-75 transition-opacity underline underline-offset-4 decoration-primary-content/50">
                  <Globe size={18} /> shoryabhushan.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="card bg-base-100 border border-base-200 shadow-sm p-6 rounded-3xl">
             <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50 mb-4">Tech Stack</h3>
             <div className="flex flex-wrap gap-2">
               <span className="badge badge-lg bg-base-200">Next.js</span>
               <span className="badge badge-lg bg-base-200">TypeScript</span>
               <span className="badge badge-lg bg-base-200">Tailwind CSS</span>
               <span className="badge badge-lg bg-base-200">Prisma</span>
               <span className="badge badge-lg bg-base-200">Neon</span>
               <span className="badge badge-lg bg-base-200">Clerk</span>
               <span className="badge badge-lg bg-base-200">Cloudinary</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
