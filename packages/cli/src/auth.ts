import fs from "fs";
import path from "path";
import os from "os";

const AUTH_DIR = path.join(os.homedir(), ".vibeforge");
const AUTH_FILE = path.join(AUTH_DIR, "auth.json");

export function getStoredToken(): string | null {
  try {
    if (!fs.existsSync(AUTH_FILE)) return null;
    const data = JSON.parse(fs.readFileSync(AUTH_FILE, "utf-8"));
    if (!data.token || !data.savedAt) return null;

    // Check if token is older than 30 days
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.savedAt > thirtyDaysMs) {
      clearToken();
      return null;
    }
    return data.token;
  } catch {
    return null;
  }
}

export function saveToken(token: string): void {
  if (!fs.existsSync(AUTH_DIR)) {
    fs.mkdirSync(AUTH_DIR, { recursive: true });
  }
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ token, savedAt: Date.now() }));
}

export function clearToken(): void {
  if (fs.existsSync(AUTH_FILE)) {
    fs.unlinkSync(AUTH_FILE);
  }
}

export async function validateTokenWithServer(apiUrl: string, token: string): Promise<any | null> {
  try {
    const res = await fetch(`${apiUrl}/api/cli/validate`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      clearToken();
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}
