import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const videoUrl = searchParams.get("url");
    const filename = searchParams.get("filename") || "download.mp4";

    if (!videoUrl) {
      return new NextResponse("Missing URL", { status: 400 });
    }

    // Fetch the video from Cloudinary
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.statusText}`);
    }

    // Create a new response that streams the Cloudinary response
    // But forces the browser to download it using the Content-Disposition header
    const headers = new Headers(response.headers);
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    headers.delete("content-encoding"); // Prevent issues with compressed streams

    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new NextResponse("Download failed", { status: 500 });
  }
}
