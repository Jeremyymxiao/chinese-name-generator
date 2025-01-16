"use client";

export const runtime = 'edge';

import { redirect } from 'next/navigation';
import React, { useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
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
      <h1 className="mb-8 text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <a
          href="/admin/users"
          className="rounded-lg border p-6 hover:bg-muted/50"
        >
          <h2 className="mb-2 text-xl font-semibold">Users</h2>
          <p className="text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </a>
        <a
          href="/admin/paid-orders"
          className="rounded-lg border p-6 hover:bg-muted/50"
        >
          <h2 className="mb-2 text-xl font-semibold">Orders</h2>
          <p className="text-muted-foreground">
            View and manage paid orders
          </p>
        </a>
      </div>
    </div>
  );
}
