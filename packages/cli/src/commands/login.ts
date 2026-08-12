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

            saveToken(data.token);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }), () => {
              console.log(chalk.green("\n✔ Authenticated successfully!\n"));
              server.close();
              clearTimeout(timeoutId);
              setTimeout(() => resolve(), 1000);
            });
          } catch (err) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: "Invalid JSON body." }));
          }
        });
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
