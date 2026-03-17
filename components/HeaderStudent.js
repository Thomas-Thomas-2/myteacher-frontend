import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightFromBracket,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../styles/HeaderStudent.module.css";
import { logout } from "../lib/api";

function HeaderStudent() {
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
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/dashboard_student" className={styles.logoLink}>
          <Image src="/LogoMT.ico" alt="Logo" width={65} height={50} />
        </Link>
      </div>

      <div className={styles.rightGroup}>
        <div className={styles.right_side}>
          <Link href="/ressources_student">
            <span className={styles.link}>Ressources</span>
          </Link>
          <Link href="/student_payments">
            <span className={styles.link}>Paiements / Factures</span>
          </Link>
          <Link href="/student_messages">
            <span className={styles.link}>Messagerie</span>
          </Link>
        </div>
        <div className={styles.profileMenuWrapper} ref={menuRef}>
          <button
            type="button"
            className={styles.btnParameters}
            onClick={() => setShowPopover(!showPopover)}
          >
            <span>{user?.firstName || "Profil"}</span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className={styles.chevronIcon}
            />
          </button>

          {showPopover && (
            <div className={styles.popover}>
              <Link href="/student_profile">
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
                <FontAwesomeIcon icon={faArrowRightFromBracket} />
                <span>Déconnexion</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HeaderStudent;
