import { describe, expect, it } from "vitest";

import { CATEGORIES } from "@/lib/catalog";
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

  it("only accepts the six shop categories", () => {
    for (const category of CATEGORIES) {
      expect(parseCategory(category.id)).toBe(category.id);
    }
    expect(parseCategory("khong-co-that")).toBeNull();
  });
});
