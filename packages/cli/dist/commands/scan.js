"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanCommand = scanCommand;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob_1 = require("glob");
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("../auth");
const reporter_1 = require("../reporter");
const fixer_1 = require("../fixer");
const SKIP_DIRS = ["node_modules", ".git", "dist", "build", ".next", "coverage", "vendor", ".turbo", ".cache", "out", "__pycache__"];
const SKIP_EXTS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot", ".otf", ".pdf", ".zip", ".tar", ".gz", ".mp4", ".mp3"];
const SKIP_PATS = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", ".lock", ".min.js", ".min.css"];
function shouldSkip(filePath) {
    const parts = filePath.split(path_1.default.sep);
    const lower = filePath.toLowerCase();
    if (parts.some((p) => SKIP_DIRS.includes(p)))
        return true;
    if (SKIP_PATS.some((pat) => lower.includes(pat)))
        return true;
    const ext = lower.includes(".") ? "." + lower.split(".").pop() : "";
    if (SKIP_EXTS.includes(ext))
        return true;
    return false;
}
async function scanCommand(dir, options, apiUrl) {
    const token = (0, auth_1.getStoredToken)();
    if (!token) {
        console.log(chalk_1.default.red("Run 'vibeforge login' first."));
        process.exit(1);
    }
    const user = await (0, auth_1.validateTokenWithServer)(apiUrl, token);
    if (!user) {
        console.log(chalk_1.default.red("Session expired or invalid. Run 'vibeforge login' again."));
        process.exit(1);
    }
    const absDir = path_1.default.resolve(dir);
    const allFiles = (0, glob_1.globSync)("**/*.{ts,js,py,go,java}", { cwd: absDir, nodir: true });
    const filesToScan = allFiles.filter((f) => !shouldSkip(f));
    if (filesToScan.length === 0) {
        console.log(chalk_1.default.yellow("No source files found to scan."));
        process.exit(0);
    }
    const batch = filesToScan.slice(0, 30);
    const filesPayload = batch.map((f) => {
        const content = fs_1.default.readFileSync(path_1.default.join(absDir, f), "utf-8");
        return { path: f, content };
    });
    const spinner = (0, ora_1.default)(`Scanning ${batch.length} files...`).start();
    try {
        const res = await fetch(`${apiUrl}/api/scan-repo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                repoUrl: `cli://${absDir}`,
                files: filesPayload,
            }),
        });
        if (!res.ok) {
            spinner.fail("Scan failed.");
            const err = await res.json().catch(() => ({ error: res.statusText }));
            console.log(chalk_1.default.red(err.error));
            process.exit(1);
        }
        const data = await res.json();
        spinner.succeed("Scan complete!");
        (0, reporter_1.printTerminalSummary)(data);
        if (options.report === "html") {
            (0, reporter_1.generateHtmlReport)(data, path_1.default.join(absDir, "report.html"));
            console.log(chalk_1.default.blue("\nHTML report generated: report.html"));
        }
        else if (options.report === "json") {
            fs_1.default.writeFileSync(path_1.default.join(absDir, "report.json"), JSON.stringify(data, null, 2));
            console.log(chalk_1.default.blue("\nJSON report generated: report.json"));
        }
        if (options.fix) {
            console.log("\nApplying fixes...");
            (0, fixer_1.applyFixes)(data.issues, absDir);
        }
    }
    catch (err) {
        spinner.fail("Scan failed due to an error.");
        console.error(err);
        process.exit(1);
    }
}
