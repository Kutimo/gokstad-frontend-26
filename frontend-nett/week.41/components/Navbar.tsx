import Link from "next/link";
import CartBadge from "./CartBadge";

const linkClass = "text-sm text-muted transition-colors hover:text-foreground";

export default function Navbar() {
    return (
        <header className="border-b border-line">
            <nav className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-8 sm:px-6">
                <Link href="/" className="mr-auto font-bold tracking-tight sm:text-lg">
                    Nettbutikken
                </Link>
                <Link href="/products" className={linkClass}>Produkter</Link>
                <Link href="/about" className={linkClass}>Om oss</Link>
                <Link href="/cart" className={`${linkClass} flex items-center gap-2`}>
                    Handlekurv <CartBadge />
                </Link>
            </nav>
        </header>
    );
}
