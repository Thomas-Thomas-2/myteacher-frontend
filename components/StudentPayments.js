import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../lib/api";
import { setInvoices } from "../reducers/invoices";
import HeaderStudent from "./HeaderStudent";
import FooterStudent from "./FooterStudent";
import styles from "../styles/StudentPayments.module.css";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

export default function StudentPaymentsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices.value || []);
  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      checkIsSignin(router);

      const { ok, data } = await api("/invoices/my");

      if (ok && data.result) {
        dispatch(setInvoices(data.invoices || []));
      } else {
        setMessage(data?.error || "Erreur lors du chargement des paiements");
      }
    })();
  }, [dispatch, router]);

  const unpaidStatuses = ["pending", "scheduled", "late"];

  const getInvoiceDate = (inv) => {
    return (
      inv.dueAt ||
      inv.eventDate ||
      inv.lessonDate ||
      inv.date ||
      inv.createdAt ||
      null
    );
  };

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const dateA = new Date(getInvoiceDate(a) || 0);
      const dateB = new Date(getInvoiceDate(b) || 0);
      return dateB - dateA;
    });
  }, [invoices]);

  const unpaidTotal = useMemo(() => {
    return sortedInvoices
      .filter((inv) => unpaidStatuses.includes(inv.status))
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [sortedInvoices]);

  const totalAmount = useMemo(() => {
    return sortedInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [sortedInvoices]);

  const paidTotal = useMemo(() => {
    return sortedInvoices
      .filter((inv) => inv.status === "paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [sortedInvoices]);

  const getStatusLabel = (status) => {
    if (status === "paid") return "Paiement effectué";
    if (status === "pending") return "Paiement en attente";
    if (status === "scheduled") return "Paiement programmé";
    if (status === "late") return "Paiement en retard";
    return "Statut inconnu";
  };

  const getStatusClass = (status) => {
    if (status === "paid") return styles.statusPaid;
    if (status === "pending") return styles.statusPending;
    if (status === "scheduled") return styles.statusScheduled;
    if (status === "late") return styles.statusLate;
    return "";
  };

  return (
    <div className={styles.page}>
      <HeaderStudent />

      <main className={styles.container}>
        <h1 className={styles.title}>PAIEMENTS / FACTURES</h1>

        <section className={styles.card}>
          <div className={styles.badgeTitle}>Mes paiements</div>

          <div className={styles.topRow}>
            <div className={styles.infoBox}>
              À régler : <strong>{unpaidTotal}€</strong>
            </div>

            <div className={styles.infoBox}>
              Déjà payés : <strong>{paidTotal}€</strong>
            </div>

            <div className={styles.infoBox}>
              Total : <strong>{totalAmount}€</strong>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            {sortedInvoices.length === 0 ? (
              <p className={styles.empty}>Aucune facture trouvée</p>
            ) : (
              sortedInvoices.map((inv) => (
                <div
                  key={inv._id}
                  className={`${styles.invoiceRow} ${
                    inv.status === "late" ? styles.lateRow : ""
                  }`}
                >
                  <div className={styles.cellLabel}>
                    {inv.label || inv.period || "Facture"}
                  </div>

                  <div className={styles.cellDate}>
                    {getInvoiceDate(inv)
                      ? new Date(getInvoiceDate(inv)).toLocaleDateString(
                          "fr-FR",
                        )
                      : "-"}
                  </div>

                  <div className={styles.cellAmount}>{inv.amount || 0}€</div>

                  <div className={styles.cellStatus}>
                    <span
                      className={`${styles.statusBadge} ${getStatusClass(inv.status)}`}
                    >
                      {getStatusLabel(inv.status)}
                    </span>
                  </div>

                  <div className={styles.cellAction}>
                    {inv.status === "paid" && inv.pdfURL ? (
                      <a
                        href={inv.pdfURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.downloadButton}
                        title="Télécharger la facture"
                      >
                        <FontAwesomeIcon icon={faDownload} />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>

          {message && <p className={styles.message}>{message}</p>}
        </section>
      </main>

      <FooterStudent />
    </div>
  );
}
