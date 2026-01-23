// src/app/myProfile/wallet/payment-history/page.jsx
import { Suspense } from "react";
import PaymentHistoryClient from "./PaymentHistoryClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <PaymentHistoryClient />
    </Suspense>
  );
}
