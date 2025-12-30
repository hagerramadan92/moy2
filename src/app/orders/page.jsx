"use client";

import SearchDriverPage from "@/components/molecules/orders/SearchDriverPage";
import AvailableDriversPage from "@/components/molecules/orders/AvailableDriversPage";
import React from "react";
import OrderDetailsPage from "@/components/molecules/orders/OrderDetailsPage";
import OrderForm from "@/components/molecules/orders/OrderForm";

export default function OrdersPage() {
  return (
    <main className="space-y-20">
      <OrderForm/>
   <SearchDriverPage/>
   <AvailableDriversPage/>
   <OrderDetailsPage/>
    </main>
  );
}
