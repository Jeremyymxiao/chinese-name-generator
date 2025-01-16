 "use client";

export const runtime = 'edge';

import { redirect } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

export default function PaidOrdersPage() {
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      redirect('/auth/signin');
    }
  }, [user]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Paid Orders</h1>
      <div className="rounded-lg border">
        {/* TODO: Add orders table */}
        <div className="p-4 text-center text-muted-foreground">
          No orders found
        </div>
      </div>
    </div>
  );
}