"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginCommand = loginCommand;
const http_1 = __importDefault(require("http"));
const crypto_1 = __importDefault(require("crypto"));
const open_1 = __importDefault(require("open"));
const chalk_1 = __importDefault(require("chalk"));
const auth_1 = require("../auth");
async function loginCommand(apiUrl) {
    const state = crypto_1.default.randomBytes(16).toString("hex");
    return new Promise((resolve, reject) => {
        const server = http_1.default.createServer((req, res) => {
            // Handle CORS for local POSTs from the browser
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");
            if (req.method === "OPTIONS") {
                res.writeHead(204);
                res.end();
                return;
            }
            if (req.method === "POST" && req.url === "/callback") {
                let body = "";
                req.on("data", (chunk) => {
                    body += chunk.toString();
                });
                req.on("end", () => {
                    try {
                        const data = JSON.parse(body);
                        if (data.state !== state) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: "Invalid state parameter." }));
                            return;
                        }
                        if (!data.token) {
                            res.writeHead(400);
                            res.end(JSON.stringify({ error: "Missing token." }));
                            return;
                        }
                        (0, auth_1.saveToken)(data.token);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ success: true }));
                        console.log(chalk_1.default.green("\n✔ Authenticated successfully!\n"));
                        server.close();
                        clearTimeout(timeoutId);
                        setTimeout(() => resolve(), 500);
                    }
                    catch (err) {
                        res.writeHead(400);
                        res.end(JSON.stringify({ error: "Invalid JSON body." }));
                    }
                });
            }
            else {
                res.writeHead(404);
                res.end();
            }
        });
        server.listen(0, async () => {
            const address = server.address();
            const actualPort = typeof address === "string" ? 9876 : address?.port || 9876;
            console.log(chalk_1.default.blue("Opening browser for authentication..."));
            try {
                await (0, open_1.default)(`${apiUrl}/cli-auth?port=${actualPort}&state=${state}`);
            }
            catch (err) {
                console.error(chalk_1.default.red("Failed to open browser. Please navigate to:"));
                console.log(`${apiUrl}/cli-auth?port=${actualPort}&state=${state}`);
            }
        });
        const timeoutId = setTimeout(() => {
            server.close();
            console.error(chalk_1.default.red("\nAuthentication timed out after 120 seconds."));
            reject(new Error("Timeout"));
        }, 120000);
    });
}
