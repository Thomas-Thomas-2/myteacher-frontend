import Image from "next/image";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/AuthForm.module.css";
import { useMemo, useState } from "react";
import { api } from "../lib/api";

export default function InviteStudent() {
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  const onInvite = async () => {
    setError("");
    setStatus("");
    setInviteLink("");
    setCopied(false);
    if (loading) return;

    setLoading(true);

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 15000); // 15s max

    try {
      const { ok, data } = await api("/invitations", {
        method: "POST",
        body: { email },
        signal: controller.signal,
      });

      if (!ok) {
        setError(data?.error || "Invite failed");
        return;
      }

      // lien toujours utile
      setInviteLink(data?.inviteLink || "");

      // message selon emailSent
      if (data?.emailSent) {
        setStatus("✅ Email envoyé !");
      } else {
        setStatus(
          `⚠️ Email non envoyé. Copie le lien et envoie-le manuellement.${
            data?.emailError ? ` (${data.emailError})` : ""
          }`,
        );
      }
    } catch (e) {
      setError("Le serveur met trop longtemps à répondre.");
    } finally {
      clearTimeout(t);
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setStatusMsg("Lien copié ✅");
    } catch {
      setError("Impossible de copier le lien automatiquement.");
    }
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
          <h1 className={styles.title}>Inviter un élève</h1>

          <div className={styles.form}>
            <input
              className={styles.input}
              type="email"
              placeholder="Email de l'élève"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              className={styles.primaryBtn}
              onClick={onInvite}
              disabled={!canSubmit || loading}
              type="button"
            >
              {loading ? "Création..." : "Créer l’invitation"}
            </button>

            {/* messages */}
            {status && <div className={styles.infoBox}>{status}</div>}
            {error && <div className={styles.errorBox}>{error}</div>}

            {/* lien + bouton copier */}
            {inviteLink && (
              <>
                <code className={styles.codeBox}>{inviteLink}</code>

                <button
                  className={styles.secondaryBtn}
                  onClick={copyToClipboard}
                  type="button"
                >
                  {copied ? "✅ Copié !" : "Copier le lien"}
                </button>
              </>
            )}
          </div>
        </div>
      </main>

      <FooterTeacher />
    </div>
  );
}
