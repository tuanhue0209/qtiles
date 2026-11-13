import { describe, expect, it } from "vitest";

const categories = [{ slug: "lat-nen" }, { slug: "op-tuong" }, { slug: "gach-moi" }];
import { isValidName, parseCategory, parsePriceInput } from "@/lib/product-form";

// Rules the shop owner cares about when editing the product list.
describe("product form rules", () => {
  it("accepts prices written the way people type them", () => {
    expect(parsePriceInput("285000")).toBe(285000);
    expect(parsePriceInput("285.000")).toBe(285000);
    expect(parsePriceInput("285 000")).toBe(285000);
  });

  it("rejects prices that are not a positive number", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("abc")).toBeNull();
    expect(parsePriceInput("0")).toBeNull();
    expect(parsePriceInput("-5000")).toBeNull();
  });

  it("needs a real product name", () => {
    expect(isValidName("Porcelain Kem Sữa")).toBe(true);
    expect(isValidName("  ")).toBe(false);
    expect(isValidName("A")).toBe(false);
  });

  it("accepts categories currently managed by the shop", () => {
    for (const category of categories) {
      expect(parseCategory(category.slug, categories)).toBe(category.slug);
    }
    expect(parseCategory("khong-co-that", categories)).toBeNull();
  });
});
