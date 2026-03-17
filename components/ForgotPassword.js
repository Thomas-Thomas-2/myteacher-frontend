import Image from "next/image";
import FooterTeacher from "./FooterTeacher";
import { useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";
import styles from "../styles/AuthForm.module.css";

function ForgotPassword() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setMsg("");
    setResetLink("");
    setLoading(true);

    const { ok, data } = await api("/users/forgot_password", {
      method: "POST",
      body: { email },
    });

    setLoading(false);

    if (!ok) return setMsg(data?.error || "Erreur");

    setMsg("Si cet email existe, un lien de réinitialisation a été généré.");

    // En dev on affiche le lien
    if (data.resetLink) setResetLink(data.resetLink);
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
          <h1 className={styles.title}>Mot de passe oublié</h1>

          <div className={styles.form}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className={styles.primaryBtn}
              onClick={onSend}
              disabled={!email || loading}
            >
              {loading ? "Envoi..." : "Générer un lien"}
            </button>

            {msg && <div className={styles.errorBox}>{msg}</div>}

            {resetLink && (
              <code
                style={{
                  display: "block",
                  padding: "10px",
                  marginTop: "10px",
                  background: "#f3f3f3",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  wordBreak: "break-all",
                }}
              >
                {resetLink}
              </code>
            )}

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

export default ForgotPassword;
