import { describe, expect, it } from "vitest";
import { validateRewrite, validateSelection } from "../lib/pipeline/validate";

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

describe("validateSelection", () => {
  it("accepts valid indices and caps at max", () => {
    expect(validateSelection({ keep: [2, 0, 4, 1] }, 5, 3)).toEqual([2, 0, 4]);
  });

  it("drops out-of-range, duplicate, and non-integer entries", () => {
    expect(validateSelection({ keep: [0, 0, 9, -1, 1.5, "2", 3] }, 5, 5)).toEqual([0, 3]);
  });

  it("accepts an empty keep list (nothing new to publish)", () => {
    expect(validateSelection({ keep: [] }, 5, 5)).toEqual([]);
  });

  it("returns null when the shape is wrong", () => {
    expect(validateSelection(null, 5, 5)).toBeNull();
    expect(validateSelection({ keep: "all" }, 5, 5)).toBeNull();
    expect(validateSelection([1, 2], 5, 5)).toBeNull();
  });
});
