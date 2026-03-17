import { useEffect, useMemo, useState } from "react";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/TeacherPayments.module.css";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

function TeacherPayments() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [message, setMessage] = useState("");
  const [studentFilter, setStudentFilter] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showUnicorn, setShowUnicorn] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/getInvoices`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data.result) {
        setInvoices(data.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
  };

  useEffect(() => {
    checkIsSignin(router);
    fetchInvoices();
  }, []);

  const unpaidStatuses = ["pending", "scheduled", "late"];

  const getInvoiceDate = (inv) => {
    // ordre de priorité
    return (
      inv.dueAt ||
      inv.eventDate ||
      inv.lessonDate ||
      inv.date ||
      inv.createdAt ||
      null
    );
  };

  const filteredInvoices = useMemo(() => {
    return (invoices || [])
      .filter((inv) => {
        const fullName = `${inv.firstName || ""} ${inv.lastName || ""}`
          .toLowerCase()
          .trim();

        const matchesStudent =
          !studentFilter ||
          fullName.includes(studentFilter.toLowerCase().trim());

        const rawDate = getInvoiceDate(inv);
        const invoiceDate = rawDate ? new Date(rawDate) : null;

        const matchesStart =
          !startDateFilter ||
          (invoiceDate && invoiceDate >= new Date(startDateFilter));

        const matchesEnd =
          !endDateFilter ||
          (invoiceDate && invoiceDate <= new Date(`${endDateFilter}T23:59:59`));

        const matchesStatus = !statusFilter || inv.status === statusFilter;

        return matchesStudent && matchesStart && matchesEnd && matchesStatus;
      })
      .sort((a, b) => {
        const dateA = new Date(getInvoiceDate(a) || 0);
        const dateB = new Date(getInvoiceDate(b) || 0);
        return dateB - dateA; // plus récent en haut
      });
  }, [invoices, studentFilter, startDateFilter, endDateFilter, statusFilter]);

  const upcomingTotal = useMemo(() => {
    return filteredInvoices
      .filter((inv) => unpaidStatuses.includes(inv.status))
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [filteredInvoices]);

  const totalAmount = useMemo(() => {
    return filteredInvoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [filteredInvoices]);

  const handleMarkPaid = async (invoiceId) => {
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/${invoiceId}/mark-paid`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ method: "cash" }),
        },
      );

      const data = await response.json();

      if (data.result) {
        setMessage("Facture marquée comme payée");
        setShowUnicorn(true);

        setTimeout(() => {
          setShowUnicorn(false);
        }, 2200);

        fetchInvoices();
      } else {
        setMessage(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Mark paid error:", error);
      setMessage("Erreur serveur");
    }
  };

  const handleDeleteInvoice = async (invoiceId) => {
    setMessage("");

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette facture ?",
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/${invoiceId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (data.result) {
        setMessage("Facture supprimée");
        fetchInvoices();
      } else {
        setMessage(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Delete invoice error:", error);
      setMessage("Erreur serveur");
    }
  };

  const handleUnmarkPaid = async (invoice) => {
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/${invoice._id}/unmark-paid`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();

      if (data.result) {
        setMessage("Facture repassée en non payé");
        fetchInvoices();
      } else {
        setMessage(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Unmark paid error:", error);
      setMessage("Erreur serveur");
    }
  };

  const handleExport = () => {
    const lines = [
      ["Élève", "Date", "Libellé", "Montant", "Statut"],
      ...filteredInvoices.map((inv) => [
        `${inv.firstName} ${inv.lastName}`,
        getInvoiceDate(inv)
          ? new Date(getInvoiceDate(inv)).toLocaleDateString("fr-FR")
          : "",
        inv.label || inv.period || "",
        `${inv.amount || 0} €`,
        inv.status || "",
      ]),
    ];

    const csvContent = lines.map((row) => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "factures_teacher.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className={styles.page}>
        <HeaderTeacher />

        <main className={styles.container}>
          <h1 className={styles.title}>PAIEMENTS</h1>

          <section className={styles.card}>
            <div className={styles.badgeTitle}>Mes factures</div>

            <div className={styles.topRow}>
              <div className={styles.infoBox}>
                Paiements non réglés : <strong>{upcomingTotal}€</strong>
              </div>

              <div className={styles.infoBox}>
                Total des paiements : <strong>{totalAmount}€</strong>
              </div>

              <button className={styles.exportButton} onClick={handleExport}>
                Exporter les factures
              </button>

              {/*<button className={styles.exportButton} onClick={handleSeedMock}>
              Générer des factures test
            </button>*/}
            </div>

            <div className={styles.filtersRow}>
              <input
                type="text"
                placeholder="Filtrer par élève"
                value={studentFilter}
                onChange={(e) => setStudentFilter(e.target.value)}
                className={styles.filterInput}
              />

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Du</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className={styles.filterInput}
                  aria-label="Date de début"
                />
              </div>

              <div className={styles.filterField}>
                <label className={styles.filterLabel}>Au</label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className={styles.filterInput}
                  aria-label="Date de fin"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterInput}
              >
                <option value="">Tous les statuts</option>
                <option value="paid">Payé</option>
                <option value="pending">En attente</option>
                <option value="scheduled">Programmé</option>
                <option value="late">En retard</option>
              </select>

              <button
                type="button"
                className={styles.resetButton}
                onClick={() => {
                  setStudentFilter("");
                  setStartDateFilter("");
                  setEndDateFilter("");
                  setStatusFilter("");
                }}
              >
                Réinitialiser
              </button>
            </div>

            <div className={styles.tableWrapper}>
              {filteredInvoices.length === 0 ? (
                <p className={styles.empty}>Aucune facture trouvée</p>
              ) : (
                filteredInvoices.map((inv) => (
                  <div
                    key={inv._id}
                    className={`${styles.invoiceRow} ${
                      inv.status === "late" ? styles.lateRow : ""
                    }`}
                  >
                    <div className={styles.cellName}>
                      {inv.firstName} {inv.lastName}
                    </div>

                    <div className={styles.cellDate}>
                      {getInvoiceDate(inv)
                        ? new Date(getInvoiceDate(inv)).toLocaleDateString(
                            "fr-FR",
                          )
                        : "-"}
                    </div>

                    <div className={styles.cellStatus}>
                      {inv.status === "paid"
                        ? "Paiement : effectué"
                        : inv.status === "pending"
                          ? "Paiement : en attente"
                          : inv.status === "scheduled"
                            ? "Paiement : programmé"
                            : "Paiement : en retard"}
                    </div>

                    <div className={styles.cellAmount}>{inv.amount}€</div>

                    <div className={styles.cellAction}>
                      {inv.status === "paid" ? (
                        <button
                          className={styles.undoPaidButton}
                          onClick={() => handleUnmarkPaid(inv)}
                          title="Repasser en non payé"
                          type="button"
                        >
                          ✓
                        </button>
                      ) : (
                        <>
                          {inv.status === "pending" ? null : (
                            <button
                              className={styles.deleteButton}
                              onClick={() => handleDeleteInvoice(inv._id)}
                              title="Supprimer la facture"
                            >
                              🗑
                            </button>
                          )}

                          <button
                            className={styles.payButton}
                            onClick={() => handleMarkPaid(inv._id)}
                            title="Marquer comme payé"
                          >
                            ⬇
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {message && <p className={styles.message}>{message}</p>}
          </section>
        </main>

        <FooterTeacher />

        {showUnicorn && (
          <div className={styles.unicornOverlay} aria-hidden="true">
            <div className={styles.unicornRun}></div>
          </div>
        )}
      </div>
    </>
  );
}

export default TeacherPayments;
