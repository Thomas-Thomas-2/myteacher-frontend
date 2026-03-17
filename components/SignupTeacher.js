import Image from "next/image";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/AuthForm.module.css";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

function SignupTeacher() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [pwdWarning, setPwdWarning] = useState("");
  const [pwdMatchWarning, setPwdMatchWarning] = useState("");

  const canSubmit = useMemo(() => {
    return (
      firstName.trim() &&
      lastName.trim() &&
      email.trim() &&
      password.length >= 8 &&
      password2.length >= 8 &&
      password === password2
    );
  }, [firstName, lastName, email, password, password2]);

  const onSignup = async () => {
    setError("");
    if (loading) return;

    if (password !== password2)
      return setError("Les mots de passe ne correspondent pas");

    setLoading(true);
    const { ok, data } = await api("/users/signup/teacher", {
      method: "POST",
      body: { firstName, lastName, email, password },
    });
    setLoading(false);

    if (!ok) return setError(data?.error || "Signup failed");

    router.push("/");
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
          <h1 className={styles.title}>Bienvenue sur MyTeacher</h1>

          <div className={styles.form}>
            <div className={styles.row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Prénom"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="Nom"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>

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
                type={showPwd2 ? "text" : "password"}
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
                onClick={() => setShowPwd2((v) => !v)}
              >
                {showPwd2 ? "Masquer" : "Afficher"}
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
              {loading ? "Création..." : "S'inscrire"}
            </button>

            {error && <div className={styles.errorBox}>{error}</div>}

            <button
              className={styles.secondaryBtn}
              onClick={() => router.replace("/signin")}
              type="button"
            >
              Déjà un compte ? Se connecter !
            </button>
          </div>
        </div>
      </main>

      <FooterTeacher />
    </div>
  );
}

export default SignupTeacher;
