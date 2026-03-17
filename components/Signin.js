import Image from "next/image";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/AuthForm.module.css";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
const { checkNeedSignin } = require("../modules/checkRole");

function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim() && password.trim();
  }, [email, password]);

  const onLogin = async () => {
    setError("");
    if (loading) return;

    setLoading(true);
    const { ok, data } = await api("/users/login", {
      method: "POST",
      body: { email, password },
    });
    setLoading(false);

    console.log("login data =", data);

    if (!ok) return setError(data?.error || "Login failed");

    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    if (data?.user) {
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    if (data?.user?.role === "student") {
      router.replace("/dashboard_student");
    } else {
      router.replace("/dashboard_teacher");
    }
  };

  useEffect(() => {
    checkNeedSignin(router);
  }, [router]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <Image
          className={styles.logo}
          src="/LogoMT.ico"
          alt="Logo"
          width={65}
          height={50}
        />
      </div>

      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>Bienvenue sur MyTeacher</h1>

          <div className={styles.form}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.togglePwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? "Masquer" : "Afficher"}
              </button>
            </div>

            <button
              className={styles.primaryBtn}
              onClick={onLogin}
              disabled={!canSubmit || loading}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push("/signup_teacher")}
              type="button"
            >
              Je suis professeur : créer un compte
            </button>

            <p style={{ marginTop: 10, fontSize: "0.95rem" }}>
              Élève ? Ton compte se crée uniquement via un lien d’invitation
              envoyé par ton professeur.
            </p>

            <button
              className={styles.linkBtn}
              onClick={() => router.push("/forgot_password")}
              type="button"
            >
              Mot de passe oublié ?
            </button>
          </div>
        </div>
      </main>

      <FooterTeacher />
    </div>
  );
}

export default Signin;
