import Image from "next/image";
import FooterStudent from "./FooterStudent";
import styles from "../styles/AuthForm.module.css";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function SignupStudent() {
  const router = useRouter();
  const { token } = router.query;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [pwdWarning, setPwdWarning] = useState("");
  const [pwdMatchWarning, setPwdMatchWarning] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!token) return;

    (async () => {
      const { ok, data } = await api(`/invitations/resolve?token=${token}`, {
        method: "GET",
      });

      if (!ok) {
        setError(data?.error || "Invitation invalide");
        return;
      }

      setFirstName(data?.invitation?.firstName || "");
      setLastName(data?.invitation?.lastName || "");
      setEmail(data?.invitation?.email || "");
    })();
  }, [token]);

  const canSubmit = useMemo(() => {
    return (
      !!token &&
      firstName.trim() &&
      lastName.trim() &&
      password.length >= 8 &&
      password2.length >= 8 &&
      password === password2
    );
  }, [token, firstName, lastName, password, password2]);

  const onSignup = async () => {
    setError("");
    setSuccess("");
    if (loading) return;

    if (!token) return setError("Lien invalide : token manquant.");
    if (password !== password2) {
      return setError("Les mots de passe ne correspondent pas");
    }

    setLoading(true);
    const { ok, data } = await api("/users/signup/student", {
      method: "POST",
      body: { token, firstName, lastName, password },
    });
    setLoading(false);

    if (!ok) return setError(data?.error || "Signup failed");

    setSuccess("Compte élève créé ✅");
    router.replace("/dashboard_student");
  };

  const tokenMissing = !token;

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
          <h1 className={styles.title}>Inscription élève</h1>

          {tokenMissing && (
            <div className={styles.errorBox}>
              Token manquant dans l’URL. Utilise le lien d’invitation envoyé par
              ton professeur.
            </div>
          )}

          <div
            className={styles.form}
            style={{ opacity: tokenMissing ? 0.6 : 1 }}
          >
            <div className={styles.row}>
              <input
                className={styles.input}
                placeholder="Prénom"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Nom"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

            <input
              className={styles.input}
              placeholder="Email"
              autoComplete="email"
              value={email}
              readOnly
            />

            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPwd ? "text" : "password"}
                placeholder="Mot de passe (8 caractères mini.)"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);

                  if (value.length > 0 && value.length < 8) {
                    setPwdWarning(
                      "Le mot de passe doit contenir au moins 8 caractères",
                    );
                  } else {
                    setPwdWarning("");
                  }
                }}
              />
              <button
                type="button"
                className={styles.togglePwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? "Masquer" : "Afficher"}
              </button>
            </div>
            {pwdWarning && <div className={styles.errorBox}>{pwdWarning}</div>}

            <div className={styles.passwordWrap}>
              <input
                className={styles.input}
                type={showPwd ? "text" : "password"}
                placeholder="Confirmation du mot de passe"
                autoComplete="new-password"
                value={password2}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword2(value);

                  if (password && value !== password) {
                    setPwdMatchWarning(
                      "Les mots de passe ne correspondent pas",
                    );
                  } else {
                    setPwdMatchWarning("");
                  }
                }}
              />
              <button
                type="button"
                className={styles.togglePwd}
                onClick={() => setShowPwd((v) => !v)}
              >
                {showPwd ? "Masquer" : "Afficher"}
              </button>
            </div>
            {pwdMatchWarning && (
              <div className={styles.errorBox}>{pwdMatchWarning}</div>
            )}

            <button
              className={styles.primaryBtn}
              onClick={onSignup}
              disabled={!canSubmit || loading}
            >
              {loading ? "Création..." : "Créer mon compte élève"}
            </button>

            {error && <div className={styles.errorBox}>{error}</div>}
            {success && <div className={styles.successBox}>{success}</div>}

            <button
              className={styles.secondaryBtn}
              onClick={() => router.replace("/signin")}
              type="button"
            >
              Déjà un compte ? Se connecter
            </button>
          </div>
        </div>
      </main>

      <FooterStudent />
    </div>
  );
}
