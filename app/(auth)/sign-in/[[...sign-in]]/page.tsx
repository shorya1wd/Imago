import { SignIn } from '@clerk/nextjs'
import { Video, Wand2, Share2 } from 'lucide-react'
import ThemeToggle from "@/components/ThemeToggle";

export default function SignInPage() {
  return (
    
    <div className="relative min-h-screen flex items-center justify-center bg-base-100 overflow-hidden p-6 lg:p-12">
    
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-between gap-16 lg:gap-8">
        
        {/* ◄ BRANDING & TEXT ► */}
        <div className="flex-1 w-full flex flex-col justify-center">
          
          <div className="mb-12">
            <h1 className="text-5xl font-black tracking-widest text-primary drop-shadow-sm">IMAGO</h1>
            <p className="text-sm uppercase font-semibold tracking-wider text-base-content/50 mt-2">Media Studio</p>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">
              Welcome back to your<br/>
              <span className="text-primary">personal studio.</span>
            </h2>
            
            <ul className="space-y-6 text-base-content/80 mt-8">
              <li className="flex items-center gap-4 text-lg">
                <div className="p-3 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-content/5">
                  <Video className="text-primary" size={24}/>
                </div>
                <span className="font-medium">Build your private, secure media library</span>
              </li>
              <li className="flex items-center gap-4 text-lg">
                <div className="p-3 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-content/5">
                  <Wand2 className="text-primary" size={24}/>
                </div>
                <span className="font-medium">Keep a permanent history of your AI creations</span>
              </li>
              <li className="flex items-center gap-4 text-lg">
                <div className="p-3 bg-base-200/50 backdrop-blur-sm rounded-xl border border-base-content/5">
                  <Share2 className="text-primary" size={24}/>
                </div>
                <span className="font-medium">Sync your content seamlessly across all devices</span>
              </li>
            </ul>
          </div>

          <div className="text-sm font-medium text-base-content/40 mt-16">
            © {new Date().getFullYear()} IMAGO Studio. All rights reserved.
          </div>
        </div>

        {/* ◄ AUTHENTICATION COMPONENT ► */}
        <div className="flex-none w-full max-w-md flex justify-center lg:justify-end">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-content normal-case",
                // Glassmorphism card effect so it blends beautifully with the ambient background
                card: "shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] rounded-2xl border border-base-content/10 bg-base-100/60 backdrop-blur-xl",
                footerActionLink: "text-primary hover:text-primary/80 font-semibold",
              }
            }}
          />
        </div>

      </div>
    </div>
  )
}