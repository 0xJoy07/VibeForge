"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyFixes = applyFixes;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const chalk_1 = __importDefault(require("chalk"));
function applyFixes(issues, basePath) {
    for (const issue of issues) {
        if (!issue.file || !issue.line || !issue.fix)
            continue;
        const fullPath = path_1.default.resolve(basePath, issue.file);
        if (!fs_1.default.existsSync(fullPath))
            continue;
        try {
            const content = fs_1.default.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            // Create backup
            fs_1.default.writeFileSync(`${fullPath}.vibeforge.bak`, content);
            // Replace lines (1-indexed)
            const startIdx = issue.line - 1;
            const endIdx = issue.lineEnd ? issue.lineEnd - 1 : startIdx;
            lines.splice(startIdx, endIdx - startIdx + 1, issue.fix);
            fs_1.default.writeFileSync(fullPath, lines.join("\n"));
            console.log(chalk_1.default.green(`✔ Fixed: ${issue.file} line ${issue.line}`));
        }
        catch (err) {
            console.error(chalk_1.default.red(`Failed to fix ${issue.file}: ${err.message}`));
        }
    }
}
