import Image from "next/image";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/AuthForm.module.css";
import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "../lib/api";

function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const onReset = async () => {
    setMsg("");

    if (!token) return setMsg("Token manquant");
    if (password.length < 8)
      return setMsg("Le mot de passe doit faire au moins 8 caractères");
    if (password !== password2)
      return setMsg("Les mots de passe ne correspondent pas");

    setLoading(true);

    const { ok, data } = await api(`/users/reset_password/${token}`, {
      method: "POST",
      body: { password },
    });

    setLoading(false);

    if (!ok) return setMsg(data?.error || "Reset failed");

    setMsg("Mot de passe modifié ✅");

    setTimeout(() => {
      router.push("/signin");
    }, 1500);
  };

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
          <h1 className={styles.title}>Réinitialiser le mot de passe</h1>

          <div className={styles.form}>
            <input
              className={styles.input}
              type="password"
              placeholder="Nouveau mot de passe"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              className={styles.input}
              type="password"
              placeholder="Confirmation du mot de passe"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
            />

            <button
              className={styles.primaryBtn}
              onClick={onReset}
              disabled={!token || loading}
            >
              {loading ? "Modification..." : "Modifier le mot de passe"}
            </button>

            {msg && <div className={styles.errorBox}>{msg}</div>}

            <button
              className={styles.secondaryBtn}
              onClick={() => router.push("/signin")}
              type="button"
            >
              Retour à la connexion
            </button>
          </div>
        </div>
      </main>

      <FooterTeacher />
    </div>
  );
}

export default ResetPassword;
