import prisma from "@/lib/prisma";
import CommunityGalleryClient from "../../../components/CommunityGalleryClient";

export const dynamic = "force-dynamic";

export default async function CommunityGallery() {
  // Fetch the 50 most recent images from ALL users directly on the server
  const images = await prisma.image.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
  });

  return (
    <CommunityGalleryClient initialImages={images} />
  );
}
   