import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Courtside — March Madness Analytics 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #0a0b0f 0%, #12141a 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Triangle logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "rgba(245, 166, 35, 0.1)",
            marginBottom: 24,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#F5A623">
            <polygon points="12,2 22,20 2,20" />
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              fontSize: 48,
              fontWeight: 800,
              color: "#e8e9ed",
              letterSpacing: "-1px",
            }}
          >
            COURTSIDE
          </span>
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#F5A623",
              background: "rgba(245, 166, 35, 0.1)",
              padding: "4px 12px",
              borderRadius: 8,
            }}
          >
            2026
          </span>
        </div>

        <span
          style={{
            fontSize: 22,
            color: "#8a8f98",
            marginBottom: 32,
          }}
        >
          March Madness Analytics & Bracket Builder
        </span>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Trapezoid of KenPom", "Interactive Bracket", "AI Analyst"].map(
            (label) => (
              <span
                key={label}
                style={{
                  fontSize: 16,
                  color: "#e8e9ed",
                  background: "#1e2028",
                  padding: "8px 20px",
                  borderRadius: 24,
                  border: "1px solid #2a2c34",
                }}
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
