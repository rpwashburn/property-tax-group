'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FloatingAdminButton() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  // Only render the button if it's not an admin route
  if (isAdminRoute) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button asChild variant="outline" size="icon" className="rounded-full shadow-lg">
        <Link href="/admin" title="Admin Panel">
          <Shield className="h-5 w-5" />
        </Link>
      </Button>
    </div>
  );
} 