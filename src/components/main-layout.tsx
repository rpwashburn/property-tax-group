import React from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { FloatingAdminButton } from '@/components/floating-admin-button';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
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