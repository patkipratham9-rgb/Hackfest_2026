import { ImageResponse } from "next/og";

/**
 * Default Open Graph / social share image (1200x630) for every route.
 * Rendered from brand colours and type at build time. No stock or AI imagery.
 */
export const alt = "LocalLoop: neighbourhood shops in Hubballi-Dharwad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#FBF8F3",
          color: "#1B3B2B",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              backgroundColor: "#1B3B2B",
              color: "#FBF8F3",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 700,
            }}
          >
            L
          </div>
          <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>
            LocalLoop
            <span style={{ color: "#C85620" }}>.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 980 }}>
            Order from neighbourhood shops in Hubballi-Dharwad
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "#1E4734" }}>
            Home delivery or counter pickup
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: "#1E4734" }}>
          <div style={{ width: 48, height: 6, backgroundColor: "#C85620", borderRadius: 3 }} />
          localloop.in
        </div>
      </div>
    ),
    size
  );
}
