import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-slate-100 border-r p-4 shrink-0">
        <h2 className="text-lg font-semibold mb-4">Admin Menu</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/" className="text-sm text-blue-600 hover:underline">← Back to Home</Link>
          <Link href="/admin" className="text-sm text-slate-700 hover:text-slate-900">Dashboard</Link>
          <Link href="/admin/properties" className="text-sm text-slate-700 hover:text-slate-900">Properties</Link>
          <Link href="/admin/comparables" className="text-sm text-slate-700 hover:text-slate-900">Comparables</Link>
          <Link href="/admin/neighborhoods" className="text-sm text-slate-700 hover:text-slate-900">Neighborhoods</Link>
          <Link href="/admin/structural-elements" className="text-sm text-slate-700 hover:text-slate-900">Structural Elements</Link>
          <Link href="/admin/fixtures" className="text-sm text-slate-700 hover:text-slate-900">Fixtures</Link>
        </nav>
      </aside>
      <main className="flex-1 py-6 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 