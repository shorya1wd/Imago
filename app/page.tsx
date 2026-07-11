import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="flex flex-col flex-1 items-center justify-center min-h-screen"
      style={{
        background:
          "radial-gradient(ellipse at 60% 20%, #2A1160 0%, #0D0520 55%, #000 100%)",
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(91,47,168,0.25) 0%, transparent 70%)",
            top: "-120px",
            left: "-100px",
            animation: "pulse 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%)",
            bottom: "-80px",
            right: "-80px",
            animation: "pulse 10s ease-in-out infinite reverse",
          }}
        />
      </div>

      <main
        className="relative flex flex-col items-center gap-10 text-center px-8 py-24 z-10"
        style={{ maxWidth: 640 }}
      >
        {/* ── Logo Wordmark ── */}
        <div style={{ animation: "fadeIn 0.8s ease-out" }}>
          <Image
            src="/imago-wordmark.svg"
            alt="Imago Media Studio"
            width={320}
            height={80}
            priority
            style={{ filter: "drop-shadow(0 0 24px rgba(245,200,66,0.35))" }}
          />
        </div>

        {/* ── Tagline ── */}
        <p
          style={{
            color: "#C4B5E0",
            fontSize: "1.15rem",
            lineHeight: 1.7,
            maxWidth: 480,
            animation: "fadeIn 1s ease-out 0.2s both",
          }}
        >
          Your AI-powered media library. Organize, transform, and share your
          images &amp; videos with intelligence.
        </p>

        {/* ── CTA Buttons ── */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
            animation: "fadeIn 1s ease-out 0.4s both",
          }}
        >
          <Link
            href="/home"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #7C3FCC, #F5C842)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.04em",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(124,63,204,0.45)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 8px 32px rgba(124,63,204,0.6)";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.transform = "";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                "0 4px 24px rgba(124,63,204,0.45)";
            }}
          >
            Enter Studio
          </Link>

          <Link
            href="/sign-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 32px",
              borderRadius: 999,
              background: "transparent",
              border: "1.5px solid rgba(245,200,66,0.45)",
              color: "#F5C842",
              fontWeight: 600,
              fontSize: "1rem",
              letterSpacing: "0.04em",
              textDecoration: "none",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "rgba(245,200,66,0.08)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "#F5C842";
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                "transparent";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(245,200,66,0.45)";
            }}
          >
            Sign In
          </Link>
        </div>
      </main>

      {/* ── Keyframe animations injected via style tag ── */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
