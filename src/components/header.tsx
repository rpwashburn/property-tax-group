import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4 md:p-6">
        <Link href="/" className="text-2xl font-bold">
          PropertyTaxGroup
        </Link>
        <nav className="space-x-4">
          <Link href="/#how-it-works" className="hover:opacity-80 transition-opacity">
            How It Works
          </Link>
          <Link href="/#success-stories" className="hover:opacity-80 transition-opacity">
            Success Stories
          </Link>
          <Link href="/contact" className="hover:opacity-80 transition-opacity">
            Contact
          </Link>
        </nav>
      </div>
    </header>
  );
} 