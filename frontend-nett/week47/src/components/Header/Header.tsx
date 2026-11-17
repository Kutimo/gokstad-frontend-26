import "./Header.css";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function Header() {
    const user = await getCurrentUser();

    return (
        <header className="header">
            <Link href="/">Home</Link>
            <nav>
                {user ? (
                    <>
                        <Link href="/notes">My notes</Link>
                        <Link href="/account">{user.name || user.email}</Link>
                        <LogoutButton />
                    </>
                ) : (
                    <>
                        <Link href="/login">Log in</Link>
                        <Link href="/register">Register</Link>
                    </>
                )}
            </nav>
        </header>
    );
}
