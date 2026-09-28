import {Link} from "react-router";
import styles from "./Nav.module.css"
import logo from "../../assets/logo.svg"

export default function Nav() {
    return (
        <nav className={styles.nav}>
            <Link className={styles.link} to="/"><img alt="logo" src={logo} height={75} width={75}/> </Link>
            <Link className={styles.link} to="/about">About</Link>
            <Link className={styles.link} to="/store">Store</Link>
        </nav>
    )
}
