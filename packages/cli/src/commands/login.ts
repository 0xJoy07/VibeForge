import http from "http";
import crypto from "crypto";
import open from "open";
import chalk from "chalk";
import { saveToken } from "../auth";

export async function loginCommand(apiUrl: string): Promise<void> {
  const state = crypto.randomBytes(16).toString("hex");

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Handle CORS for local POSTs from the browser
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      if (req.method === "GET" && req.url?.startsWith("/callback")) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const urlToken = url.searchParams.get("token");
        const queryState = url.searchParams.get("state");

        if (queryState !== state) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authentication Failed</h1><p>Invalid state parameter. Please try logging in again.</p>");
          return;
        }
        if (!urlToken) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end("<h1>Authentication Failed</h1><p>Missing token. Please try logging in again.</p>");
          return;
        }

        saveToken(urlToken);
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          `<html>
            <body style="background: black; color: white; display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; text-align: center; flex-direction: column;">
              <div style="width: 64px; height: 64px; border-radius: 50%; background: #00c97a; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h1 style="margin: 0 0 8px;">Terminal authenticated!</h1>
              <p style="color: #999; margin: 0;">You can safely close this tab and return to your terminal.</p>
              <script>setTimeout(() => window.close(), 3000);</script>
            </body>
          </html>`, 
          () => {
            console.log(chalk.green("\n✔ Authenticated successfully!\n"));
            server.close();
            clearTimeout(timeoutId);
            setTimeout(() => resolve(), 1000);
          }
        );
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    server.listen(0, "127.0.0.1", async () => {
      const address = server.address();
      const actualPort = typeof address === "string" ? 9876 : address?.port || 9876;
      console.log(chalk.blue("Opening browser for authentication..."));
      try {
        await open(`${apiUrl}/cli-auth?port=${actualPort}&state=${state}`);
      } catch (err) {
        console.error(chalk.red("Failed to open browser. Please navigate to:"));
        console.log(`${apiUrl}/cli-auth?port=${actualPort}&state=${state}`);
      }
    });

    const timeoutId = setTimeout(() => {
      server.close();
      console.error(chalk.red("\nAuthentication timed out after 120 seconds."));
      reject(new Error("Timeout"));
    }, 120_000);
  });
}
