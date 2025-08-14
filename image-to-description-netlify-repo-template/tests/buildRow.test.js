import { describe, it, expect, vi } from "vitest";
import { buildRow } from "../netlify/functions/lib/rows.js";

vi.useFakeTimers().setSystemTime(new Date("2025-01-01T00:00:00.000Z"));

describe("buildRow", () => {
  it("handles full payload", () => {
    const input = {
      title: "Eco Bottle",
      short_description: "Lightweight bottle",
      long_description: "A durable, reusable bottle for everyday use.",
      features: ["BPA-free", "Leak-proof"],
      seo: {
        slug: "eco-bottle",
        metaTitle: "Eco Bottle – Reusable Water Bottle",
        metaDescription: "Durable, BPA-free reusable bottle.",
        keywords: ["bottle", "eco", "reusable"],
        tags: ["hydration", "green"],
      },
      _meta: { brand: "Prestige House", audience: "Gen Z", tone: "friendly", lang: "en" },
    };
    const row = buildRow(input);
    expect(row).toHaveLength(14);
    expect(row[0]).toBe("2025-01-01T00:00:00.000Z");
    expect(row[1]).toBe("Eco Bottle");
    expect(row[5]).toBe("eco-bottle");
    expect(row[8]).toBe("bottle, eco, reusable");
    expect(row[9]).toBe("hydration, green");
  });

  it("handles minimal payload", () => {
    const row = buildRow({});
    expect(row).toHaveLength(14);
    expect(typeof row[0]).toBe("string");
    for (let i = 1; i < row.length; i++) expect(row[i]).toBe("");
  });

  it("joins arrays safely", () => {
    const row = buildRow({ features: [], seo: { keywords: [], tags: [] } });
    expect(row[4]).toBe("");
    expect(row[8]).toBe("");
    expect(row[9]).toBe("");
  });

  it("preserves Thai / Unicode fields", () => {
    const input = {
      title: "ขวดรักษ์โลก",
      short_description: "ขวดน้ำพกพา น้ำหนักเบา",
      long_description: "ขวดน้ำสำหรับใช้ซ้ำ วัสดุทนทาน เหมาะกับการใช้งานทุกวัน",
      features: ["ปลอดสาร BPA", "ไม่รั่วซึม"],
      seo: {
        slug: "eco-bottle-th",
        metaTitle: "ขวดน้ำรักษ์โลก – ใช้ซ้ำได้",
        metaDescription: "ทนทาน ปลอดภัย ใช้ง่าย",
        keywords: ["ขวดน้ำ", "รักษ์โลก"],
        tags: ["สุขภาพ", "สิ่งแวดล้อม"],
      },
      _meta: { brand: "Prestige House", audience: "คนรักสุขภาพ", tone: "friendly", lang: "th" },
    };
    const row = buildRow(input);
    expect(row[1]).toBe("ขวดรักษ์โลก");
    expect(row[8]).toBe("ขวดน้ำ, รักษ์โลก");
    expect(row[9]).toBe("สุขภาพ, สิ่งแวดล้อม");
  });

  it("handles undefined seo object gracefully", () => {
    const input = { title: "No SEO" };
    const row = buildRow(input);
    expect(row[5]).toBe("");
    expect(row[6]).toBe("");
    expect(row[7]).toBe("");
  });
});
