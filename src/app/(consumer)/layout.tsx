import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { FloatingAdminButton } from '@/components/floating-admin-button';

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-grow">
        {children}
      </main>
      <Footer />
      <FloatingAdminButton />
    </>
  );
} 