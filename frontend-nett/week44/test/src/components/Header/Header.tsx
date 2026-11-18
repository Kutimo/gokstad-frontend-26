import styles from "./Header.module.css";
import Link from "next/link";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function Header() {
    const payload = await getPayload({ config });
    const header = await payload.findGlobal({ slug: "header", depth: 1 });

    return (
        <header className={styles.header}>
            <div className={styles.inner}>
                <Link className={styles.logo} href="/">{header.siteName || "Home"}</Link>
                <nav className={styles.nav}>
                    {header.navItems?.map((item) => {
                        if (typeof item.page !== "object") return null;
                        const href = item.page.slug === "home" ? "/" : `/${item.page.slug}`;

                        return (
                            <Link key={item.id} href={href}>
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
