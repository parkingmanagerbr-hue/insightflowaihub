// useSubscription.ts — billing via GENIA Billing Service
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
        return;
      }
      const { data, error } = await supabase.functions.invoke("check-subscription", {
        body: { product_slug: PRODUCT_SLUG },
      });
      if (error) {
        console.warn("[useSubscription] error, fail-open:", error);
        setStatus({ active: true, source: "fail-open" });
        return;
      }
      setStatus(data as BillingStatus);
    } catch (err) {
      console.warn("[useSubscription] network error, fail-open:", err);
      setStatus({ active: true, source: "fail-open" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    check();
    // Recheck when auth state changes
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(() => {
      check();
    });
    return () => authSub.unsubscribe();
  }, [check]);

  return {
    isActive: status?.active ?? true, // fail-open: true while loading
    isLoading: loading,
    plan: status?.plan,
    activeUntil: status?.active_until ? new Date(status.active_until) : null,
    refetch: check,
  };
}
