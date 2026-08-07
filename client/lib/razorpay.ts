import RazorpayClient from "razorpay";

const globalForRazorpay = globalThis as unknown as { razorpay: RazorpayClient | undefined };

function createRazorpayClient(): RazorpayClient {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set.");
  }
  return new RazorpayClient({ key_id: keyId, key_secret: keySecret });
}

export const razorpay: RazorpayClient =
  globalForRazorpay.razorpay ?? createRazorpayClient();

if (process.env.NODE_ENV !== "production") {
  globalForRazorpay.razorpay = razorpay;
}
