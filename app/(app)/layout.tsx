"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Image as ImageIcon, Video, Menu ,FileVideo} from 'lucide-react'
import { UserButton, useUser } from '@clerk/nextjs'
import ThemeToggle from "@/components/ThemeToggle";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // ◄ Pull in isLoaded to prevent layout flashing while Clerk checks auth state
  const { user, isLoaded } = useUser(); 

  const navItems = [
    { href: '/home', label: 'Video Gallery', icon: <Home size={20} /> },
    { href: '/social-share', label: 'Imago Studio', icon: <ImageIcon size={20} /> },
    {href:'/image-gallery', label: 'Image Gallery', icon: <ImageIcon size={20} /> }
  ];

  // If the user is logged in, add the My Videos and Upload routes to the sidebar
  if (user) {
    navItems.push(
      { href: '/my-videos', label: 'My Videos', icon: <FileVideo size={20} /> },
      { href: '/video-upload', label: 'Upload Video', icon: <Video size={20} /> },
      { href: '/my-images', label: 'My Images', icon: <ImageIcon size={20} /> }
    );
  }

  return (
    <div className="drawer lg:drawer-open h-screen bg-base-100">
      <input id="imago-drawer" type="checkbox" className="drawer-toggle" />
      
      {/* ---------------- MAIN CONTENT AREA ---------------- */}
      <div className="drawer-content flex flex-col h-screen overflow-hidden">
        
        {/* Mobile Header */}
        <div className="w-full navbar bg-base-200 lg:hidden border-b border-base-300">
          <div className="flex-none">
            <label htmlFor="imago-drawer" aria-label="open sidebar" className="btn btn-square btn-ghost">
              <Menu size={24} />
            </label>
          </div>
          <div className="flex-1">
            <Link href="/" className="flex items-center gap-2 ml-2 hover:opacity-80 transition-opacity">
              <Image src="/imago-logo.svg" alt="Imago logo" width={32} height={32} priority />
              <span className="font-black text-xl tracking-widest text-primary">IMAGO</span>
            </Link>
          </div>
          
          {/* ◄ MOBILE AUTH BUTTONS (Native React Logic) ► */}
          <div className="flex-none flex items-center gap-2 mr-2">
            <ThemeToggle />
            {!isLoaded ? null : user ? (
              <UserButton />
            ) : (
              <Link href="/sign-in" className="btn btn-primary btn-sm">Sign In</Link>
            )}
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto w-full">
          {children}
        </main>
      </div> 

      {/* ---------------- SIDEBAR NAVIGATION ---------------- */}
      <div className="drawer-side z-50">
        <label htmlFor="imago-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
        
        <div className="flex flex-col w-72 min-h-full bg-base-200 border-r border-base-300 text-base-content">
          
          {/* Desktop Logo Header */}
          <div className="p-6 hidden lg:flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <Image
                src="/imago-logo.svg"
                alt="Imago logo"
                width={48}
                height={48}
                priority
                style={{ filter: 'drop-shadow(0 0 8px rgba(245,200,66,0.4))' }}
              />
              <div>
                <h1 className="text-3xl font-black tracking-widest text-primary">IMAGO</h1>
                <p className="text-xs text-base-content/50 mt-1 uppercase font-semibold tracking-wider">Media Studio</p>
              </div>
            </Link>
            
            {/* ◄ ADD THE TOGGLE HERE FOR DESKTOP ► */}
            <ThemeToggle />
          </div>

          {/* Navigation Links */}
          <ul className="menu p-4 w-full flex-1 gap-2">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-primary text-primary-content font-bold shadow-md' 
                        : 'hover:bg-base-300 font-medium'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* ◄ DESKTOP AUTH BUTTONS (Native React Logic) ► */}
          {!isLoaded ? (
            <div className="p-4 m-4 flex justify-center">
              <span className="loading loading-spinner text-primary"></span>
            </div>
          ) : user ? (
            <div className="p-4 m-4 bg-base-300 rounded-2xl flex items-center gap-3 shadow-inner">
              <UserButton />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">
                  {user.firstName || 'Creator'}
                </span>
                <span className="text-xs text-base-content/60 truncate">
                  {user.primaryEmailAddress?.emailAddress || 'Account'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 m-4">
              <Link href="/sign-in" className="btn btn-primary w-full">Sign In</Link>
            </div>
          )}
          
        </div>
      </div>
    </div>
  )
}