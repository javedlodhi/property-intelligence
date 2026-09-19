import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDirectory = new URL("../public/", import.meta.url);
const archiveDirectory = new URL("../data/", import.meta.url);
const archive = new URL("../data/dubai-land-transactions-2026.csv", import.meta.url);
const parts = [
  new URL("../public/dubai-land-transactions-2026-part-1.csv", import.meta.url),
  new URL("../public/dubai-land-transactions-2026-part-2.csv", import.meta.url),
];

const lines = readFileSync(archive, "utf8").split(/\r?\n/);
const header = lines.shift();
const midpoint = Math.ceil(lines.length / 2);
mkdirSync(archiveDirectory, { recursive: true });
writeFileSync(parts[0], [header, ...lines.slice(0, midpoint)].join("\n"));
writeFileSync(parts[1], [header, ...lines.slice(midpoint)].join("\n"));
console.log(`Split ${join(archiveDirectory.pathname, "dubai-land-transactions-2026.csv")} into two Worker-compatible assets.`);
