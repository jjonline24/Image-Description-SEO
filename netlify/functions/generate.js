import { client } from "./lib/openai.js";

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const { imageDataUrl, lang, tone, brand, audience } = JSON.parse(event.body || "{}");
    if (!imageDataUrl) {
      return { statusCode: 400, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "No image" }) };
    }

    const productSchema = {
      type: "object",
      additionalProperties: false,
      properties: {
        title: { type: "string" },
        short_description: { type: "string" },
        long_description: { type: "string" },
        features: { type: "array", items: { type: "string" } },
        seo: {
          type: "object",
          additionalProperties: false,
          properties: {
            slug: { type: "string" },
            metaTitle: { type: "string" },
            metaDescription: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            tags: { type: "array", items: { type: "string" } },
          },
          required: ["slug", "metaTitle", "metaDescription", "keywords", "tags"],
        },
      },
      required: ["title", "short_description", "long_description", "features", "seo"],
    };

    const input = [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `You are a product copywriter + SEO expert. Analyze the image and write copy for an ecommerce product page.

Requirements:
- Output language: ${lang === "th" ? "Thai" : "English"}.
- Tone: ${tone}.
- Brand (if provided): ${brand || "N/A"}.
- Target audience: ${audience}.
- Include realistic attributes you can infer from the image (materials, color, use-cases).
- Avoid inventing specs you cannot see. If unsure, use safe phrasing (e.g., "available in multiple sizes").
- Follow the JSON schema strictly.`,
          },
          { type: "input_image", image_url: imageDataUrl },
        ],
      },
    ];

    const r = await client.responses.create({
      model: process.env.OPENAI_VISION_MODEL || "gpt-4o-mini",
      input,
      text: {
        format: {
          type: "json_schema",
          name: "ProductCopy",
          schema: productSchema,   // << ที่ API ต้องการ
          strict: true,
        },
      },
    });

    const text = r.output_text || "{}";
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        statusCode: 500,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to parse model output as JSON", raw: text?.slice(0, 500) }),
      };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, _meta: { lang, tone, brand, audience } }),
    };
  } catch (err) {
    return { statusCode: 500, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: err.message || "Server error" }) };
  }
}
