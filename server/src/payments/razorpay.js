"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpay = void 0;
const razorpay_1 = __importDefault(require("razorpay"));
const globalForRazorpay = globalThis;
function createClient() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env");
    }
    return new razorpay_1.default({ key_id: keyId, key_secret: keySecret });
}
/**
 * Singleton Razorpay client — cached on `globalThis` so hot-reloads in tsx watch
 * don't create multiple instances.
 */
exports.razorpay = globalForRazorpay._razorpay ?? (globalForRazorpay._razorpay = createClient());
//# sourceMappingURL=razorpay.js.map