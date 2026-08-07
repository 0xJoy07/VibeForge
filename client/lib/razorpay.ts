import RazorpayClient from "razorpay";

const globalForRazorpay = globalThis as unknown as { razorpay: RazorpayClient | null | undefined };

function createRazorpayClient(): RazorpayClient | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new RazorpayClient({ key_id: keyId, key_secret: keySecret });
}

export const razorpay: RazorpayClient | null =
  globalForRazorpay.razorpay !== undefined ? globalForRazorpay.razorpay : createRazorpayClient();

if (process.env.NODE_ENV !== "production") {
  globalForRazorpay.razorpay = razorpay;
}
