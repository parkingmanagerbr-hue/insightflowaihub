// useSubscription.ts — GENIA Billing Service (direct call, no Edge Function needed)
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const BILLING_URL = "https://billing.veloxisit.com.br";
const PRODUCT_SLUG = "insightflow"; // hardcoded per product

interface BillingStatus {
  active: boolean;
  plan?: string;
  active_until?: string;
  source?: string;
}

export function useSubscription() {
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus({ active: false });
        setLoading(false);
        return;
      }

      const res = await fetch(`${BILLING_URL}/subscriptions/check`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product_slug: PRODUCT_SLUG }),
      });

      if (!res.ok) {
        console.warn("[useSubscription] billing error, fail-open:", res.status);
        setStatus({ active: true, source: "fail-open" });
        return;
      }

      const data: BillingStatus = await res.json();
      setStatus(data);
    } catch (err) {
      console.warn("[useSubscription] network error, fail-open:", err);
      setStatus({ active: true, source: "fail-open" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => authSub.unsubscribe();
  }, [check]);

  return {
    isActive: status?.active ?? true, // fail-open: true while loading
    isLoading: loading,
    loading,                           // alias for backward compat
    plan: status?.plan,
    activeUntil: status?.active_until ? new Date(status.active_until) : null,
    refetch: check,
    // Legacy shape for components that destructure subscription object
    subscription: status ? { status: status.active ? "active" : "inactive", plan_type: status.plan ?? "free" } : null,
    error: null,
  };
}
