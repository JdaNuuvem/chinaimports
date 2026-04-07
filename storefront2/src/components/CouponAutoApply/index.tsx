"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/context/CartContext";

function CouponAutoApplyInner() {
  const searchParams = useSearchParams();
  const { cart } = useCart();
  const [applied, setApplied] = useState(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("coupon") || searchParams.get("cupom") || searchParams.get("discount");
    if (code && !applied) {
      setCouponCode(code.toUpperCase());
      // Store for later use in checkout
      sessionStorage.setItem("auto_coupon", code.toUpperCase());
    }
  }, [searchParams, applied]);

  useEffect(() => {
    if (!couponCode || !cart?.id || applied) return;

    const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000";
    fetch(`${backendUrl}/store/carts/${cart.id}/apply-coupon`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setApplied(true);
        }
      })
      .catch(() => {});
  }, [couponCode, cart?.id, applied]);

  if (!couponCode) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 60,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 950,
        background: applied ? "#f0fdf4" : "#fffbeb",
        border: `1px solid ${applied ? "#bbf7d0" : "#fde68a"}`,
        borderRadius: 8,
        padding: "10px 20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 8,
        animation: "fadeInDown 0.3s ease-out",
        fontSize: 13,
      }}
    >
      <span style={{ fontSize: 16 }}>{applied ? "✅" : "🎟️"}</span>
      <span style={{ fontWeight: 600, color: applied ? "#16a34a" : "#92400e" }}>
        {applied
          ? `Cupom ${couponCode} aplicado!`
          : `Aplicando cupom ${couponCode}...`}
      </span>
      {applied && (
        <button
          onClick={() => setCouponCode(null)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", marginLeft: 8 }}
        >
          ✕
        </button>
      )}
      <style dangerouslySetInnerHTML={{ __html: "@keyframes fadeInDown { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }" }} />
    </div>
  );
}

export default function CouponAutoApply() {
  return (
    <Suspense fallback={null}>
      <CouponAutoApplyInner />
    </Suspense>
  );
}
