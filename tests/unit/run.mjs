// Compiles the framework-free modules (store, seed, selectors, numeric parsing, form model) with the repo's own
// TypeScript and runs the node:test suites against the output. No extra dependencies.
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../..");
const out = path.join(root, ".unit-build");
fs.rmSync(out, { recursive: true, force: true });
execFileSync(process.execPath, [path.join(root, "node_modules/typescript/bin/tsc"), "-p", path.join(here, "tsconfig.json")], { stdio: "inherit", cwd: root });
fs.writeFileSync(path.join(out, "package.json"), '{"type":"commonjs"}');

// Resolve the "@/..." alias to the compiled output.
const Module = createRequire(import.meta.url)("node:module");
const orig = Module._resolveFilename;
Module._resolveFilename = function (request, ...rest) {
  return orig.call(this, request.startsWith("@/") ? path.join(out, request.slice(2)) : request, ...rest);
};
globalThis.__UNIT_OUT__ = out;

// Run every suite in this process so they share the alias hook; node:test sets a non-zero exit code on failure.
const require = createRequire(import.meta.url);
process.on("exit", () => fs.rmSync(out, { recursive: true, force: true }));
for (const f of fs.readdirSync(here).filter((x) => x.endsWith(".test.cjs")).sort()) require(path.join(here, f));
