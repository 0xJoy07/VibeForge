#!/usr/bin/env node
import { Command } from "commander";
import { batchFiles, scanFiles } from "./scanner.ts";
import { mergeResults } from "./ai.ts";
import { reviewBatch } from "./anthropic.ts";
import { applyFixes } from "./fixer.ts";
import { printReport, writeHtmlReport, writeJsonReport } from "./reporter.ts";

const program = new Command();

program
  .name("vibeforge")
  .description("AI-powered codebase scanner")
  .version("0.1.0");

program
  .command("scan")
  .argument("<path>", "folder to scan")
  .option("--report <format>", "html or json")
  .option("--fix", "apply AI fixes to files with .vibeforge.bak backups")
  .option("--key <apikey>", "Anthropic API key")
  .action(async (targetPath, options) => {
    const files = await scanFiles(targetPath);
    console.log(`Scanning ${files.length} files...`);
    if (!files.length) {
      console.log("No supported files found.");
      return;
    }

    const apiKey = options.key ?? process.env.ANTHROPIC_API_KEY;
    const batches = batchFiles(files, 30);
    const results = [];
    for (const batch of batches) {
      results.push(await reviewBatch(batch, apiKey));
    }
    const result = mergeResults(results);
    printReport(result);

    if (options.report === "html") await writeHtmlReport(result);
    if (options.report === "json") await writeJsonReport(result);
    if (options.fix) await applyFixes(targetPath, result.issues);
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
