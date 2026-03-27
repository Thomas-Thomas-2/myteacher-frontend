import { useEffect, useMemo, useState } from "react";
import styles from "../styles/ModalAddStudent.module.css";
import { api } from "../lib/api";

export default function ModalAddStudent({ student, onClose, onInvited }) {
  const [email, setEmail] = useState(student?.email || "");
  const [inviteLink, setInviteLink] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const canSubmit = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);

  useEffect(() => {
    setEmail(student?.email || "");
  }, [student]);

  const onInvite = async () => {
    setError("");
    setStatusMsg("");
    setInviteLink("");
    setCopied(false);

    const normalized = email.trim().toLowerCase();
    if (!normalized) return setError("Email manquant");
    if (loading) return;

    setLoading(true);
    try {
      const { ok, data } = await api("/invitations", {
        method: "POST",
        body: { email: normalized },
      });

      console.log("INVITE API RESULT ✅", { ok, data });

      if (!ok) {
        setError(data?.error || "Invite failed");
        return;
      }

      const link = data?.inviteLink || "";
      setInviteLink(link);

      if (data?.emailSent === true) {
        setStatusMsg("✅ Email envoyé !");
      } else {
        setStatusMsg("⚠️ Email non envoyé. Copie le lien ci-dessous.");
      }
    } catch (e) {
      console.error("INVITE ERROR", e);
      setError("Le serveur met trop longtemps à répondre.");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Impossible de copier le lien");
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {/*<h2 className={styles.title}>Inviter un élève</h2>*/}
          {student && (
            <p className={styles.studentName}>
              Invitation pour{" "}
              <strong>
                {student.firstName} {student.lastName}
              </strong>
            </p>
          )}
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Fermer la fenêtre"
          >
            <span className={styles.closeIcon}></span>
          </button>
        </div>

        <p className={styles.helper}>
          L’élève recevra un lien pour créer son compte (valable 48h).
        </p>

        <input
          className={styles.input}
          type="email"
          placeholder="Email de l'élève"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose} type="button">
            Annuler
          </button>
          <button
            className={styles.primary}
            onClick={onInvite}
            type="button"
            disabled={!canSubmit || loading}
          >
            {loading ? "Envoi..." : "Envoyer"}
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        {statusMsg && <div className={styles.successBox}>{statusMsg}</div>}

        {inviteLink && (
          <div className={styles.linkBox}>
            <div className={styles.linkText}>{inviteLink}</div>
            <button className={styles.copyBtn} onClick={onCopy} type="button">
              {copied ? "✅ Copié !" : "Copier"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
