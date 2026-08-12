#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const login_1 = require("./commands/login");
const scan_1 = require("./commands/scan");
const auth_1 = require("./auth");
const config_1 = require("./config");
const program = new commander_1.Command();
program
    .name("vibeforge")
    .description("VibeForge CLI - AI-powered codebase analysis")
    .version("0.1.0");
program
    .command("login")
    .description("Authenticate the CLI with your VibeForge account")
    .action(async () => {
    try {
        await (0, login_1.loginCommand)(config_1.WEB_BASE_URL);
    }
    catch (err) {
        console.error(chalk_1.default.red("Login failed."));
        process.exit(1);
    }
});
program
    .command("logout")
    .description("Log out and clear stored credentials")
    .action(() => {
    (0, auth_1.clearToken)();
    console.log(chalk_1.default.green("Logged out successfully."));
});
program
    .command("scan [path]")
    .description("Scan a local directory")
    .option("--report <format>", "Generate a report file (html or json)")
    .option("--fix", "Attempt to automatically apply AI-suggested fixes")
    .action(async (pathStr, options) => {
    const targetPath = pathStr || ".";
    await (0, scan_1.scanCommand)(targetPath, options, config_1.API_BASE_URL);
});
program
    .command("whoami")
    .description("Check your authentication status")
    .action(async () => {
    const token = (0, auth_1.getStoredToken)();
    if (!token) {
        console.log(chalk_1.default.red("Not logged in. Run 'vibeforge login'."));
        process.exit(1);
    }
    const user = await (0, auth_1.validateTokenWithServer)(config_1.API_BASE_URL, token);
    if (user) {
        console.log(chalk_1.default.green(`Logged in as ${user.email}`));
        console.log(`Pro status: ${user.isPro ? chalk_1.default.green("Active") : chalk_1.default.red("Inactive")}`);
    }
    else {
        console.log(chalk_1.default.red("Session expired. Run 'vibeforge login'."));
        process.exit(1);
    }
});
program.parse();
