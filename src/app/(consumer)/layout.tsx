import React from 'react';

export default function ConsumerPagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </main>
  );
} 