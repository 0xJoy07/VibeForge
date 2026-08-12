import RazorpayClient from "razorpay";

const globalForRazorpay = globalThis as unknown as { _razorpay?: RazorpayClient };

function createClient(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in .env"
    );
  }
  return new RazorpayClient({ key_id: keyId, key_secret: keySecret });
}

/**
 * Singleton Razorpay client — cached on `globalThis` so hot-reloads in tsx watch
 * don't create multiple instances.
 */
export const razorpay: RazorpayClient =
  globalForRazorpay._razorpay ?? (globalForRazorpay._razorpay = createClient());
