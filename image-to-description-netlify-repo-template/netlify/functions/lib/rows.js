export function buildRow(result = {}) {
  const now = new Date();
  const features = Array.isArray(result.features) ? result.features.join(" | ") : "";
  const seo = result.seo || {};
  const keywords = Array.isArray(seo.keywords) ? seo.keywords.join(", ") : "";
  const tags = Array.isArray(seo.tags) ? seo.tags.join(", ") : "";

  return [
    now.toISOString(),
    result.title || "",
    result.short_description || "",
    result.long_description || "",
    features,
    seo.slug || "",
    seo.metaTitle || "",
    seo.metaDescription || "",
    keywords,
    tags,
    (result._meta && result._meta.brand) || "",
    (result._meta && result._meta.audience) || "",
    (result._meta && result._meta.tone) || "",
    (result._meta && result._meta.lang) || "",
  ];
}
