import { appendProductRow } from "./lib/sheets.js";
import { buildRow } from "./lib/rows.js";

export async function handler(event) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }
    const body = JSON.parse(event.body || "{}");
    const { result, options } = body || {};
    if (!result) return { statusCode: 400, body: JSON.stringify({ error: "No result payload" }) };

    const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) throw new Error("Missing SHEETS_SPREADSHEET_ID");

    const sheetName = (options && options.sheetName) || process.env.SHEETS_SHEET_NAME || "Sheet1";
    const row = buildRow(result);

    await appendProductRow({ spreadsheetId, sheetName, row });

    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || "Export failed" }) };
  }
}
