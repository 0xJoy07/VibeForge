import fs from "fs";
import path from "path";
import chalk from "chalk";
export function applyFixes(issues, basePath) {
    for (const issue of issues) {
        if (!issue.file || !issue.line || !issue.fix)
            continue;
        const fullPath = path.resolve(basePath, issue.file);
        if (!fs.existsSync(fullPath))
            continue;
        try {
            const content = fs.readFileSync(fullPath, "utf-8");
            const lines = content.split("\n");
            // Create backup
            fs.writeFileSync(`${fullPath}.vibeforge.bak`, content);
            // Replace lines (1-indexed)
            const startIdx = issue.line - 1;
            const endIdx = issue.lineEnd ? issue.lineEnd - 1 : startIdx;
            lines.splice(startIdx, endIdx - startIdx + 1, issue.fix);
            fs.writeFileSync(fullPath, lines.join("\n"));
            console.log(chalk.green(`✔ Fixed: ${issue.file} line ${issue.line}`));
        }
        catch (err) {
            console.error(chalk.red(`Failed to fix ${issue.file}: ${err.message}`));
        }
    }
}
