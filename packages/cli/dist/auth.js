"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStoredToken = getStoredToken;
exports.saveToken = saveToken;
exports.clearToken = clearToken;
exports.validateTokenWithServer = validateTokenWithServer;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const AUTH_DIR = path_1.default.join(os_1.default.homedir(), ".vibeforge");
const AUTH_FILE = path_1.default.join(AUTH_DIR, "auth.json");
function getStoredToken() {
    try {
        if (!fs_1.default.existsSync(AUTH_FILE))
            return null;
        const data = JSON.parse(fs_1.default.readFileSync(AUTH_FILE, "utf-8"));
        if (!data.token || !data.savedAt)
            return null;
        // Check if token is older than 30 days
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.savedAt > thirtyDaysMs) {
            clearToken();
            return null;
        }
        return data.token;
    }
    catch {
        return null;
    }
}
function saveToken(token) {
    if (!fs_1.default.existsSync(AUTH_DIR)) {
        fs_1.default.mkdirSync(AUTH_DIR, { recursive: true });
    }
    fs_1.default.writeFileSync(AUTH_FILE, JSON.stringify({ token, savedAt: Date.now() }));
}
function clearToken() {
    if (fs_1.default.existsSync(AUTH_FILE)) {
        fs_1.default.unlinkSync(AUTH_FILE);
    }
}
async function validateTokenWithServer(apiUrl, token) {
    try {
        const res = await fetch(`${apiUrl}/api/cli/validate`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
            clearToken();
            return null;
        }
        return await res.json();
    }
    catch {
        return null;
    }
}
