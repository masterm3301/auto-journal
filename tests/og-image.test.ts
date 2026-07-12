import { describe, expect, it } from "vitest";
import { extractOgImage } from "../lib/pipeline/og-image";

describe("extractOgImage", () => {
  it("extracts og:image with property before content", () => {
    const html = `<head><meta property="og:image" content="https://cdn.example/a.jpg" /></head>`;
    expect(extractOgImage(html)).toBe("https://cdn.example/a.jpg");
  });

  it("extracts og:image with content before property", () => {
    const html = `<meta content="https://cdn.example/b.jpg" property="og:image"/>`;
    expect(extractOgImage(html)).toBe("https://cdn.example/b.jpg");
  });

  it("returns null when absent or not an http url", () => {
    expect(extractOgImage("<head></head>")).toBeNull();
    expect(extractOgImage(`<meta property="og:image" content="/relative.jpg">`)).toBeNull();
  });
});
