import { google } from "googleapis";

export async function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Missing Google service account envs");

  const jwt = new google.auth.JWT({
    email,
    key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });
  await jwt.authorize();
  return google.sheets({ version: "v4", auth: jwt });
}

export async function appendProductRow({ spreadsheetId, sheetName = "Sheet1", row }) {
  const sheets = await getSheetsClient();
  const range = `${sheetName}!A:Z`;
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
