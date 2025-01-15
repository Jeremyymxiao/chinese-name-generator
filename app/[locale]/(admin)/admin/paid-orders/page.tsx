export const runtime = 'edge';

import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import React from 'react';

export default async function PaidOrdersPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
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
