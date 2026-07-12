import { describe, expect, it } from "vitest";
import { validateRewrite } from "../lib/pipeline/validate";

const valid = {
  title: "عنوان المقال",
  dek: "مقدمة قصيرة",
  body: "فقرة أولى.\n\nفقرة ثانية.",
  category: "economy",
  slug: "morocco-economy-growth",
};

describe("validateRewrite", () => {
  it("accepts a valid rewrite object", () => {
    const result = validateRewrite(valid);
    expect(result).toEqual(valid);
  });

  it("rejects non-objects and missing fields", () => {
    expect(validateRewrite(null)).toBeNull();
    expect(validateRewrite("nope")).toBeNull();
    expect(validateRewrite({ ...valid, title: "" })).toBeNull();
    expect(validateRewrite({ ...valid, body: undefined })).toBeNull();
  });

  it("rejects unknown categories", () => {
    expect(validateRewrite({ ...valid, category: "weather" })).toBeNull();
  });

  it("normalizes messy slugs to [a-z0-9-]", () => {
    const result = validateRewrite({ ...valid, slug: "Économie 2024!" });
    expect(result!.slug).toBe("economie-2024");
  });

  it("falls back to a generated slug when the slug is empty or unusable", () => {
    const result = validateRewrite({ ...valid, slug: "عنوان-عربي" });
    expect(result!.slug).toMatch(/^khabar-[a-z0-9]+$/);
  });
});
