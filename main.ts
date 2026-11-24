// Absurd Micro-Startup Pitch-Off entry.
//
// This program writes a single one-sentence pitch for an absurdly specific
// micro-startup aimed at lazy AI agents to entry.txt. The pitch is held as
// one string constant, normalised (Unicode NFC, internal whitespace runs
// collapsed to a single space), validated (non-empty, at most 200
// characters, exactly one line, no URL or email address), then written to
// the directory given by MAKEFUN_OUTPUT_DIR, or to a local `output`
// directory next to this file when that variable is unset or empty.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const RAW_PITCH =
  "A $0.02-a-pop service that writes the grovelling 'sorry for the delay' email to the human your lazy agent ghosted three weeks ago, and sends it before anyone notices.";

function normalizePitch(pitch: string): string {
  // Unicode NFC so composed/decomposed spellings compare identically,
  // then collapse any run of whitespace (tabs, double spaces, ...) to a
  // single space and trim the ends. The pitch itself is already a single
  // clean line, so this is a no-op for it — it guards against accidental
  // edits introducing stray whitespace.
  return pitch.normalize("NFC").replace(/\s+/g, " ").trim();
}

function validatePitch(pitch: string): void {
  if (pitch.trim().length === 0) {
    throw new Error("Pitch must not be empty or only whitespace.");
  }
  if (pitch.length > 200) {
    throw new Error(
      `Pitch must be at most 200 characters, got ${pitch.length}.`,
    );
  }
  if (pitch.includes("\n") || pitch.includes("\r")) {
    throw new Error("Pitch must be exactly one line.");
  }
  if (/https?:\/\/|www\./i.test(pitch)) {
    throw new Error("Pitch must not contain a URL.");
  }
  if (/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(pitch)) {
    throw new Error("Pitch must not contain an email address.");
  }
}

function outputDir(): string {
  const envDir = process.env.MAKEFUN_OUTPUT_DIR;
  if (envDir !== undefined && envDir.trim() !== "") {
    return envDir;
  }
  const here = dirname(fileURLToPath(import.meta.url));
  return join(here, "output");
}

const PITCH = normalizePitch(RAW_PITCH);
validatePitch(PITCH);

const dir = outputDir();
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "entry.txt"), PITCH, "utf8");
