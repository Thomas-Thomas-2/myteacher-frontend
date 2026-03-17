import { useMemo, useState } from "react";
import styles from "../styles/ModalAddStudent.module.css";
import { api } from "../lib/api";

export default function ModalCreateStudent({ onClose, onCreated }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      /\S+@\S+\.\S+/.test(email.trim())
    );
  }, [firstName, lastName, email]);

  const onCreate = async () => {
    setError("");
    setStatusMsg("");
    if (loading) return;

    setLoading(true);

    try {
      const { ok, data } = await api("/students/addStudent", {
        method: "POST",
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
        },
      });

      if (!ok) {
        setError(data?.error || "Création impossible");
        return;
      }

      setStatusMsg("✅ Prospect créé avec succès");

      if (typeof onCreated === "function") {
        onCreated(data);
      }
    } catch (e) {
      console.error("CREATE STUDENT ERROR", e);
      setError("Erreur serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Ajouter un élève</h2>
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
          Crée un prospect avec son prénom, son nom et son email.
        </p>

        <input
          className={styles.input}
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className={styles.input}
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className={styles.input}
          type="email"
          placeholder="Email de l'élève"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className={styles.actions}>
          <button className={styles.secondary} onClick={onClose} type="button">
            Annuler
          </button>
          <button
            className={styles.primary}
            onClick={onCreate}
            type="button"
            disabled={!canSubmit || loading}
          >
            {loading ? "Création..." : "Créer le prospect"}
          </button>
        </div>

        {error && <div className={styles.errorBox}>{error}</div>}
        {statusMsg && <div className={styles.successBox}>{statusMsg}</div>}
      </div>
    </div>
  );
}
