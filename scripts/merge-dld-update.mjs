import { readFileSync, writeFileSync } from "node:fs";

const archivePath = new URL("../data/dubai-land-transactions-2026.csv", import.meta.url);
const updatePath = process.argv[2];

if (!updatePath) {
  throw new Error("Usage: node scripts/merge-dld-update.mjs /path/to/transactions.csv");
}

function csvRecords(input) {
  const records = [];
  let start = 0;
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    const next = input[index + 1];

    if (character === '"') {
      if (quoted && next === '"') index += 1;
      else quoted = !quoted;
    } else if ((character === "\n" || character === "\r") && !quoted) {
      records.push(input.slice(start, index));
      start = character === "\r" && next === "\n" ? index + 2 : index + 1;
      if (character === "\r" && next === "\n") index += 1;
    }
  }

  if (start < input.length) records.push(input.slice(start));
  return records.filter(Boolean);
}

function firstValue(record) {
  let value = "";
  let quoted = false;

  for (let index = 0; index < record.length; index += 1) {
    const character = record[index];
    const next = record[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else quoted = !quoted;
    } else if (character === "," && !quoted) break;
    else value += character;
  }

  return value.replace(/^\uFEFF/, "").trim();
}

const archiveRecords = csvRecords(readFileSync(archivePath, "utf8"));
const updateRecords = csvRecords(readFileSync(updatePath, "utf8"));
const archiveHeader = archiveRecords.shift();
const updateHeader = updateRecords.shift();

if (!archiveHeader || !updateHeader || archiveHeader.replace(/^\uFEFF/, "") !== updateHeader.replace(/^\uFEFF/, "")) {
  throw new Error("The update CSV headers do not match the dashboard dataset.");
}

const knownTransactions = new Set(archiveRecords.map(firstValue));
const additions = updateRecords.filter((record) => {
  const transactionNumber = firstValue(record);
  if (!transactionNumber || knownTransactions.has(transactionNumber)) return false;
  knownTransactions.add(transactionNumber);
  return true;
});

writeFileSync(archivePath, [archiveHeader, ...archiveRecords, ...additions].join("\n") + "\n");
console.log(`Merged ${additions.length} new records; skipped ${updateRecords.length - additions.length} duplicates.`);
