import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/HeaderTeacher.module.css";
import { logout } from "../lib/api";

function HeaderTeacher() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showPopover, setShowPopover] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();

        if (data.result) {
          setUser(data.user);
        }
      } catch (e) {
        console.error("Fetch user failed:", e);
      }
    };

    fetchUser();
  }, []);

  // ferme le popover quand on clique ailleurs
  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowPopover(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      router.push("/signin");
    }
  };

  return (
    <header className={styles.content}>
      <div className={styles.logo}>
        <Link href="/dashboard_teacher" className={styles.logoLink}>
          <Image src="/LogoMT.ico" alt="Logo" width={65} height={50} />
        </Link>
      </div>
      <div className={styles.menu}>
        <button className={styles.btnNavigation}>
          <Link href="/structures_teacher">
            <span className={styles.menuText}>Structures</span>
          </Link>
        </button>
        <button className={styles.btnNavigation}>
          <Link href="/ressources_teacher">
            <span className={styles.menuText}>Ressources</span>
          </Link>
        </button>
        <button className={styles.btnNavigation}>
          <Link href="/teacher_payments">
            <span className={styles.menuText}>Paiements / Factures</span>
          </Link>
        </button>
        <button className={styles.btnNavigation}>
          <Link href="/teacher_messages">
            <span className={styles.menuText}>Messagerie</span>
          </Link>
        </button>
        <div className={styles.profileMenuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.btnParameters}
            onClick={() => setShowPopover(!showPopover)}
          >
            <span>{user?.firstName || "Profil"}</span>
            <FontAwesomeIcon icon={faChevronDown} className={styles.icon} />
          </button>

          {showPopover && (
            <div className={styles.popover}>
              <Link href="/teacher_profile">
                <a className={styles.popoverItem}>
                  <span className={styles.popoverIcon}>👤</span>
                  <span>Mon profil</span>
                </a>
              </Link>
              <button
                type="button"
                className={styles.popoverLogout}
                onClick={handleLogout}
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className={styles.icon}
                />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderTeacher;
