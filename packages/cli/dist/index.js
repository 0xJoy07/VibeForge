#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { loginCommand } from "./commands/login.js";
import { scanCommand } from "./commands/scan.js";
import { clearToken, getStoredToken, validateTokenWithServer } from "./auth.js";
const API_URL = process.env.VIBEFORGE_API_URL || "http://localhost:3000";
const program = new Command();
program
    .name("vibeforge")
    .description("VibeForge CLI - AI-powered codebase analysis")
    .version("0.1.0");
program
    .command("login")
    .description("Authenticate the CLI with your VibeForge account")
    .action(async () => {
    try {
        await loginCommand(API_URL);
    }
    catch (err) {
        console.error(chalk.red("Login failed."));
        process.exit(1);
    }
});
program
    .command("logout")
    .description("Log out and clear stored credentials")
    .action(() => {
    clearToken();
    console.log(chalk.green("Logged out successfully."));
});
program
    .command("scan [path]")
    .description("Scan a local directory")
    .option("--report <format>", "Generate a report file (html or json)")
    .option("--fix", "Attempt to automatically apply AI-suggested fixes")
    .action(async (pathStr, options) => {
    const targetPath = pathStr || ".";
    await scanCommand(targetPath, options, API_URL);
});
program
    .command("whoami")
    .description("Check your authentication status")
    .action(async () => {
    const token = getStoredToken();
    if (!token) {
        console.log(chalk.red("Not logged in. Run 'vibeforge login'."));
        process.exit(1);
    }
    const user = await validateTokenWithServer(API_URL, token);
    if (user) {
        console.log(chalk.green(`Logged in as ${user.email}`));
        console.log(`Pro status: ${user.isPro ? chalk.green("Active") : chalk.red("Inactive")}`);
    }
    else {
        console.log(chalk.red("Session expired. Run 'vibeforge login'."));
        process.exit(1);
    }
});
program.parse();
