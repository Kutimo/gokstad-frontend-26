import styles from "./Footer.module.css";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function Footer() {
    const payload = await getPayload({ config });
    const footer = await payload.findGlobal({ slug: "footer" });

    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                {footer.text && <p>{footer.text}</p>}
                {footer.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}
            </div>
        </footer>
    );
}
