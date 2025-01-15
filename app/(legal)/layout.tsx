import React from 'react';
import { MdOutlineHome } from "react-icons/md";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <a href="/" className="inline-block p-4">
        <MdOutlineHome className="text-2xl" />
      </a>
      <div className="container py-8">
        <article className="prose max-w-none dark:prose-invert">
          {children}
        </article>
      </div>
    </div>
  );
}
