# Imago — Media Studio

**AI-powered media sharing and editing**
Imago is a high-performance media platform for uploading, browsing, downloading, and editing images and videos with Cloudinary-powered optimization and AI transformations.

### Project Snapshot
* **Role:** Lead Full-Stack Developer (Solo Project)
* **Timeline:** ~6 Weeks
* **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS & DaisyUI, Prisma, PostgreSQL (Neon), Clerk Auth, Cloudinary (CDN & AI)

## Project Details
Imago is a high-performance, full-stack media platform designed to streamline how users upload, optimize, and edit images and videos. By integrating seamless background compression and AI-driven transformations, Imago provides a professional-grade media studio directly in the browser. It focuses on **fast performance, smart media handling, and a clean user experience.**

## Key Features & Capabilities
* **Asynchronous Video Processing:** Built an intelligent auto-polling UI that allows users to seamlessly upload files **up to 100MB** without locking up their browser, displaying real-time bandwidth savings once Cloudinary finishes backend compression.
* **AI-Powered Image Studio:** Integrated advanced editing tools directly into the platform, including background removal, generative color replacement, image restoration, and smart-cropping for specific social media aspect ratios.
* **Frictionless Media Delivery:** Implemented automated hover-previews for videos and highly optimized download links, **reducing average file payloads by 30-40%** to drastically reduce bandwidth consumption.
* **Tiered Access & Security:** Engineered a seamless dual-access system. The platform allows for anonymous public browsing and downloading, while securing uploads, deletions, and personal dashboards ("My Videos" / "My Images") behind a robust authentication layer.

## Why Imago?
Content creators and marketing teams constantly struggle with bloated media files that slow down websites and eat up storage costs. Imago solves this by acting as an intelligent middleman. It **automatically compresses heavy video files** in the background, applies smart AI cropping for social media formats, and provides a frictionless UI. It’s designed for businesses that need their media to be fast to upload, cheap to store, and instantly ready for distribution.

## Technical Architecture
* **Frontend & API:** Built on **Next.js** using strict **TypeScript** to leverage server-side rendering for sub-second gallery loading and secure API routes for media syncing. Styled with **Tailwind CSS and DaisyUI** for a clean, responsive, and highly maintainable UI.
* **Database & ORM:** Powered by a PostgreSQL database (via **Neon**) and managed with **Prisma**, ensuring strict type safety across the entire stack when relational mapping users to their media assets.
* **Media Infrastructure:** Deep integration with **Cloudinary** for enterprise-grade CDN delivery, on-the-fly format shifting, and complex AI transformations, ensuring the app remains lightweight regardless of file sizes.
* **Authentication:** Secured by **Clerk** to handle session management and user identity without complicating the core codebase.

## Security & Access
Imago uses authentication only where it adds value, while keeping the public media browsing experience open and simple. Signed-in users can upload and manage their own content, while public visitors can browse and download anonymously. Media ownership stays private, so uploaded content does not expose user identity. That balance keeps the platform easy to use without giving up control or security.

## Challenges Solved

* **Stale State & Background Syncing:** Solved the challenge of asynchronous video processing by engineering a custom API route that polls Cloudinary for derived file sizes. This ensures the PostgreSQL database and the React UI stay **perfectly in sync with Cloudinary’s background workers**, automatically updating the client's screen from "Processing" to "Finished" **without requiring a page refresh**.
* **Data Integrity & Format Shifting Discrepancies:** Cloudinary's aggressive background optimization can cause database mismatches—for example, compressing a video to a tiny `.webm` file while the client requests an `.mp4` download. I standardized the eager transformation pipeline to ensure the backend polling strictly filtered for specific formats and mathematically verified file sizes, guaranteeing that the **"Bandwidth Saved" UI metrics perfectly matched the exact file delivered** to the end user.
* **Preventing Race Conditions & Dead Pages:** Handling heavy media compression in the background created a timing gap where users could attempt to download a file before the server finished processing it, resulting in browser timeouts. I implemented a dynamic, auto-polling UI state that intercepts download requests, visually indicates "Processing," and **automatically unlocks the exact millisecond the backend confirms the file is ready**, completely eliminating dead navigation.

## Getting Started (Local Development)

If you'd like to run this project locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd imago
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` or `.env.local` file in the root directory and add the following keys:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
   CLERK_SECRET_KEY=

   # Database (Neon / PostgreSQL)
   DATABASE_URL=

   # Cloudinary
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

4. **Initialize Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
