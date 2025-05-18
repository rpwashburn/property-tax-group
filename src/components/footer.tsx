import Link from "next/link";
import { Home, Shield } from "lucide-react";

export default function Footer() {
  return (
    <div className="container max-w-7xl mx-auto px-4"> 
    <footer className="border-t bg-background py-6 md:py-8">
        <div className="container flex flex-col items-center gap-4 px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between md:gap-8">
            <div className="flex items-center gap-2 text-lg font-bold">
              <Shield className="h-5 w-5 text-primary" />
              <span>PropertyTaxGroup</span>
            </div>
            <nav className="flex gap-4 sm:gap-6">
              <Link className="text-sm font-medium hover:underline" href="#">
                About
              </Link>
              <Link className="text-sm font-medium hover:underline" href="#">
                How It Works
              </Link>
              <Link className="text-sm font-medium hover:underline" href="#">
                FAQ
              </Link>
              <Link className="text-sm font-medium hover:underline" href="#">
                Contact
              </Link>
            </nav>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} PropertyTaxGroup. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 