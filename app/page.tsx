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
        <div className="orb orb-purple" />
        <div className="orb orb-gold" />
      </div>

      <main
        className="relative flex flex-col items-center gap-10 text-center px-8 py-24 z-10"
        style={{ maxWidth: 640 }}
      >
        {/* ── Logo Wordmark ── */}
        <div className="fade-in-up">
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
        <p className="fade-in-up delay-1 imago-tagline">
          Create, curate, and share your world. A smart media studio for images
          &amp; videos — powered by AI.
        </p>

        {/* ── CTA Buttons ── */}
        <div className="fade-in-up delay-2 imago-cta-row">
          <Link href="/home" className="btn-primary-imago">
            Enter Studio
          </Link>
          <Link href="/sign-in" className="btn-outline-imago">
            Sign In
          </Link>
        </div>
      </main>

      <style>{`
        .orb {
          position: absolute;
          border-radius: 50%;
        }
        .orb-purple {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(91,47,168,0.25) 0%, transparent 70%);
          top: -120px; left: -100px;
          animation: pulse 8s ease-in-out infinite;
        }
        .orb-gold {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(245,200,66,0.12) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation: pulse 10s ease-in-out infinite reverse;
        }
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }

        .imago-tagline {
          color: #C4B5E0;
          font-size: 1.15rem;
          line-height: 1.7;
          max-width: 480px;
        }
        .imago-cta-row {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Primary CTA */
        .btn-primary-imago {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 32px;
          border-radius: 999px;
          background: linear-gradient(135deg, #7C3FCC, #F5C842);
          color: #fff;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.04em;
          text-decoration: none;
          box-shadow: 0 4px 24px rgba(124,63,204,0.45);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn-primary-imago:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(124,63,204,0.6);
        }

        /* Outline CTA */
        .btn-outline-imago {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 32px;
          border-radius: 999px;
          background: transparent;
          border: 1.5px solid rgba(245,200,66,0.45);
          color: #F5C842;
          font-weight: 600;
          font-size: 1rem;
          letter-spacing: 0.04em;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-outline-imago:hover {
          background: rgba(245,200,66,0.08);
          border-color: #F5C842;
        }

        @keyframes fadeInUp {
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
