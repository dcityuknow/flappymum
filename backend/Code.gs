/**
 * GLOBAL LEADERBOARD BACKEND — Google Apps Script
 * Reads/writes score rows in a "Leaderboard" sheet: Name | Score | Character | Date
 * Full setup steps: see the repo's README.md.
 */

const SHEET_NAME = 'Leaderboard';
const MAX_ROWS_RETURNED = 10;

// Handles GET requests — returns the top scores as JSON.
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();

  // Skip the header row (row 1)
  const rows = values.slice(1)
    .filter(r => r[0] !== '' && r[0] !== undefined) // ignore empty rows
    .map(r => ({
      name: String(r[0] || 'Anonymous'),
      score: Number(r[1]) || 0,
      charNum: Number(r[2]) || 1,
      date: r[3] ? new Date(r[3]).getTime() : 0
    }));

  rows.sort((a, b) => b.score - a.score);
  const top = rows.slice(0, MAX_ROWS_RETURNED);

  return ContentService
    .createTextOutput(JSON.stringify(top))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handles POST requests — appends a new score row.
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: 'Invalid JSON body' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const name = String(body.name || 'Anonymous').slice(0, 20);
  const score = Number(body.score) || 0;
  const charNum = Number(body.charNum) || 1;

  sheet.appendRow([name, score, charNum, new Date()]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
