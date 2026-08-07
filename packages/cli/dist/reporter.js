import fs from "fs";
import chalk from "chalk";
export function generateHtmlReport(results, outputPath) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VibeForge Scan Report</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 40px; }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: #00c97a; margin-top: 0; }
    .header-card { background: #161616; border: 1px solid #333; padding: 32px; border-radius: 16px; display: flex; gap: 48px; align-items: center; margin-bottom: 40px; }
    .score-circle { width: 140px; height: 140px; border-radius: 50%; border: 12px solid #00c97a; display: flex; align-items: center; justify-content: center; font-size: 48px; font-weight: bold; flex-shrink: 0; }
    .axes { flex: 1; }
    .axis { margin-bottom: 12px; }
    .axis-label { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px; color: #a1a1aa; }
    .axis-bar-bg { background: #27272a; height: 6px; border-radius: 3px; overflow: hidden; }
    .axis-bar-fill { background: #00c97a; height: 100%; }
    .issue { background: #161616; border: 1px solid #333; padding: 24px; border-radius: 12px; margin-bottom: 16px; }
    .issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
    .critical { background: #ef444433; color: #ef4444; }
    .warning { background: #f59e0b33; color: #f59e0b; }
    .info { background: #3b82f633; color: #3b82f6; }
    .issue-title { font-size: 18px; font-weight: 600; margin: 0; }
    .issue-desc { color: #a1a1aa; line-height: 1.5; margin: 0 0 16px 0; }
    .issue-loc { font-family: monospace; color: #71717a; font-size: 14px; margin-bottom: 16px; display: block; }
    .fix-block { background: #000; border: 1px solid #333; padding: 16px; border-radius: 8px; font-family: monospace; white-space: pre-wrap; color: #10b981; }
  </style>
</head>
<body>
  <div class="container">
    <h1>VibeForge Report</h1>
    
    <div class="header-card">
      <div class="score-circle">${results.scores?.security ?? results.score ?? 0}</div>
      <div class="axes">
        ${results.scores ? Object.entries(results.scores).map(([k, v]) => `
          <div class="axis">
            <div class="axis-label"><span>${k.toUpperCase()}</span><span>${v}/100</span></div>
            <div class="axis-bar-bg"><div class="axis-bar-fill" style="width: ${v}%"></div></div>
          </div>
        `).join("") : `<div class="axis-label">Score: ${results.score}</div>`}
      </div>
    </div>

    <h2>Issues (${results.issues.length})</h2>
    ${results.issues.map((i) => `
      <div class="issue">
        <div class="issue-header">
          <span class="badge ${i.severity}">${i.severity}</span>
          <h3 class="issue-title">${i.title}</h3>
        </div>
        <span class="issue-loc">${i.file ? i.file + (i.line ? `:${i.line}` : '') : 'Global'}</span>
        <p class="issue-desc">${i.description}</p>
        ${i.fix ? `<div class="fix-block">${i.fix.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>` : ''}
      </div>
    `).join("")}
  </div>
</body>
</html>
  `;
    fs.writeFileSync(outputPath, html.trim());
}
export function printTerminalSummary(results) {
    console.log("\n" + chalk.bold("VIBEFORGE SCAN RESULTS"));
    console.log("======================");
    const score = results.scores?.security ?? results.score ?? 0;
    let gradeColor = chalk.green;
    if (results.grade === "B")
        gradeColor = chalk.cyan;
    if (results.grade === "C")
        gradeColor = chalk.yellow;
    if (results.grade === "D")
        gradeColor = chalk.magenta;
    if (results.grade === "F")
        gradeColor = chalk.red;
    console.log(`\nGrade: ${gradeColor.bold(results.grade)}  (Score: ${score}/100)\n`);
    if (results.scores) {
        for (const [key, val] of Object.entries(results.scores)) {
            const v = val;
            const filled = Math.round(v / 5);
            const empty = 20 - filled;
            const bar = chalk.green("█".repeat(filled)) + chalk.gray("░".repeat(empty));
            console.log(`${key.padEnd(14)} ${bar} ${v}`);
        }
    }
    console.log(`\nFound ${chalk.bold(results.issues.length)} issues.\n`);
    for (const issue of results.issues) {
        let severity = chalk.blue("INFO");
        if (issue.severity === "warning")
            severity = chalk.yellow("WARN");
        if (issue.severity === "critical")
            severity = chalk.red("CRIT");
        const loc = issue.file ? ` (${issue.file}${issue.line ? `:${issue.line}` : ''})` : "";
        console.log(`${severity} ${chalk.bold(issue.title)}${chalk.gray(loc)}`);
        console.log(`  ${issue.description}\n`);
    }
}
