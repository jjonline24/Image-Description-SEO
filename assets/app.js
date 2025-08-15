const fileInput = document.getElementById("file");
const dropZone = document.getElementById("drop-zone");
const placeholder = document.getElementById("placeholder");
const previewHolder = document.getElementById("preview-holder");
const preview = document.getElementById("preview");
const btnGenerate = document.getElementById("generate");
const langEl = document.getElementById("lang");
const toneEl = document.getElementById("tone");
const brandEl = document.getElementById("brand");
const audienceEl = document.getElementById("audience");
const resultEl = document.getElementById("result");
const resultEmptyEl = document.getElementById("result-empty");
const rTitle = document.getElementById("r-title");
const rShort = document.getElementById("r-short");
const rLong = document.getElementById("r-long");
const rFeaturesWrap = document.getElementById("r-features-wrap");
const rFeatures = document.getElementById("r-features");
const rSlug = document.getElementById("r-slug");
const rMetaTitle = document.getElementById("r-metaTitle");
const rMetaDescription = document.getElementById("r-metaDescription");
const rKeywordsWrap = document.getElementById("r-keywords-wrap");
const rKeywords = document.getElementById("r-keywords");
const rTagsWrap = document.getElementById("r-tags-wrap");
const rTags = document.getElementById("r-tags");
const btnCopy = document.getElementById("copy");
const btnDownload = document.getElementById("download");
const btnToSheets = document.getElementById("to-sheets");

let CURRENT_JSON = null;

dropZone.addEventListener("dragover", (e) => e.preventDefault());
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files?.[0];
  if (file) onFile(file);
});
dropZone.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => onFile(e.target.files?.[0] || null));

function onFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    preview.src = reader.result;
    placeholder.classList.add("hidden");
    previewHolder.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
}

btnGenerate.addEventListener("click", async () => {
  const dataUrl = preview.src;
  if (!dataUrl || dataUrl.startsWith("http")) {
    alert("กรุณาเลือกรูปภาพก่อนค่ะ");
    return;
  }
  btnGenerate.disabled = true;
  try {
    const res = await fetch("/.netlify/functions/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageDataUrl: dataUrl,
        lang: langEl.value,
        tone: toneEl.value,
        brand: brandEl.value,
        audience: audienceEl.value,
      }),
    });
    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      if (res.status === 404) {
        message = "Netlify Function ไม่เจอ (404) — มักเกิดจากดีพลอยแบบสแตติกที่ไม่มี Functions. ให้ดีพลอยผ่าน Netlify CLI หรือเชื่อมต่อ Git แล้ว Deploy ใหม่ค่ะ.";
      } else {
        try { message = await res.text(); } catch {}
      }
      throw new Error(message);
    }
    const json = await res.json();
    CURRENT_JSON = json;
    renderResult(json);
  } catch (e) {
    alert(e?.message || "Generation failed");
  } finally {
    btnGenerate.disabled = false;
  }
});

function renderResult(data) {
  resultEmptyEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  rTitle.textContent = data.title || "";
  rShort.textContent = data.short_description || "";
  rLong.textContent = data.long_description || "";
  if (Array.isArray(data.features) && data.features.length) {
    rFeaturesWrap.classList.remove("hidden");
    rFeatures.innerHTML = data.features.map((x) => `<li>${x}</li>`).join("");
  } else {
    rFeaturesWrap.classList.add("hidden");
  }
  const seo = data.seo || {};
  rSlug.textContent = seo.slug || "";
  rMetaTitle.textContent = seo.metaTitle || "";
  rMetaDescription.textContent = seo.metaDescription || "";
  if (Array.isArray(seo.keywords) && seo.keywords.length) {
    rKeywordsWrap.classList.remove("hidden");
    rKeywords.innerHTML = seo.keywords.map((k) => `<span>${k}</span>`).join("");
  } else rKeywordsWrap.classList.add("hidden");
  if (Array.isArray(seo.tags) && seo.tags.length) {
    rTagsWrap.classList.remove("hidden");
    rTags.innerHTML = seo.tags.map((k) => `<span>#${k}</span>`).join("");
  } else rTagsWrap.classList.add("hidden");
}

btnCopy.addEventListener("click", () => {
  if (!CURRENT_JSON) return;
  navigator.clipboard.writeText(JSON.stringify(CURRENT_JSON, null, 2));
  alert("คัดลอกแล้ว");
});

btnDownload.addEventListener("click", () => {
  if (!CURRENT_JSON) return;
  const blob = new Blob([JSON.stringify(CURRENT_JSON, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `product-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

btnToSheets.addEventListener("click", async () => {
  if (!CURRENT_JSON) return;
  try {
    const res = await fetch("/.netlify/functions/export-sheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result: CURRENT_JSON, options: {} }),
    });
    if (!res.ok) throw new Error(await res.text());
    alert("ส่งข้อมูลเข้า Google Sheets แล้ว ✨");
  } catch (e) {
    alert(e?.message || "ส่งเข้า Sheets ไม่สำเร็จ");
  }
});
