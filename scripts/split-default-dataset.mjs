import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDirectory = new URL("../public/", import.meta.url);
const archiveDirectory = new URL("../data/", import.meta.url);
const archive = new URL("../data/dubai-land-transactions-2026.csv", import.meta.url);
const parts = [
  new URL("../public/dubai-land-transactions-2026-part-1.csv", import.meta.url),
  new URL("../public/dubai-land-transactions-2026-part-2.csv", import.meta.url),
];

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
      const end = character === "\r" && next === "\n" ? index : index;
      records.push(input.slice(start, end));
      start = character === "\r" && next === "\n" ? index + 2 : index + 1;
      if (character === "\r" && next === "\n") index += 1;
    }
  }

  if (start < input.length) records.push(input.slice(start));
  return records.filter(Boolean);
}

const records = csvRecords(readFileSync(archive, "utf8"));
const header = records.shift();
const midpoint = Math.ceil(records.length / 2);
mkdirSync(archiveDirectory, { recursive: true });
writeFileSync(parts[0], [header, ...records.slice(0, midpoint)].join("\n"));
writeFileSync(parts[1], [header, ...records.slice(midpoint)].join("\n"));
console.log(`Split ${join(archiveDirectory.pathname, "dubai-land-transactions-2026.csv")} into two Worker-compatible assets.`);
