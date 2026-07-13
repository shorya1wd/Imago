import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs'
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Imago — Media Studio",
  description: "Create, curate, and share your world. Imago is a smart media studio for images and videos — powered by AI.",
  applicationName: "Imago Media Studio",
  openGraph: {
    title: "Imago — Media Studio",
    description: "Create, curate, and share your world. Imago is a smart media studio for images and videos — powered by AI.",
    url: "https://www.imagomediastudio.com",
    siteName: "Imago Media Studio",
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" }
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="forest" themes={['light', 'forest']} attribute="data-theme">
          {children}
          <Toaster richColors position="top-right" /> 
        </ThemeProvider>
      </body>
    </html>
    </ClerkProvider>
    
  );
}
