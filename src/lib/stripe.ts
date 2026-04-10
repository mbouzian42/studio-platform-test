/**
 * Stripe integration placeholder.
 *
 * In production, initialize with:
 * import Stripe from "stripe";
 * const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
 *
 * For now, functions return mock data so the booking flow works end-to-end
 * without a real Stripe API key.
 */

export interface CheckoutSession {
  id: string;
  url: string;
  amount: number;
  status: "pending" | "paid" | "failed";
}

/**
 * Create a Stripe checkout session (mock).
 * In production, this calls stripe.checkout.sessions.create().
 */
export async function createCheckoutSession(params: {
  amount: number;
  description: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}): Promise<CheckoutSession> {
  // Mock: return a fake session that redirects to the success URL
  const sessionId = `mock_session_${Date.now()}`;
  return {
    id: sessionId,
    url: `${params.successUrl}?session_id=${sessionId}`,
    amount: params.amount,
    status: "pending",
  };
}

/**
 * Process a Stripe refund (mock).
 * In production, this calls stripe.refunds.create().
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amount?: number;
}): Promise<{ id: string; status: string }> {
  return {
    id: `mock_refund_${Date.now()}`,
    status: "succeeded",
  };
}
