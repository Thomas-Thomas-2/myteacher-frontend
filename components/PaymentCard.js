import styles from "../styles/PaymentCard.module.css";

function PaymentCard(props) {
  const formattedDate = props.date
    ? new Date(props.date).toLocaleDateString("fr-FR")
    : "-";

  const statusLabel =
    props.status === "paid"
      ? "Payé"
      : props.status === "late"
        ? "En retard"
        : props.status === "scheduled"
          ? "Programmé"
          : "En attente";

  const statusClass =
    props.status === "paid"
      ? styles.paid
      : props.status === "late"
        ? styles.late
        : props.status === "scheduled"
          ? styles.scheduled
          : styles.pending;

  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <p className={styles.name}>
          {props.firstname} {props.lastname}
        </p>
        <p className={styles.term}>
          {props.discipline || "Discipline non renseignée"}
        </p>
      </div>

      <div className={styles.middle}>
        <p className={styles.date}>{formattedDate}</p>
      </div>

      <div className={styles.middle}>
        <p className={styles.amount}>{props.amount || 0} €</p>
      </div>

      <div className={styles.right}>
        <p className={`${styles.status} ${statusClass}`}>{statusLabel}</p>
      </div>
    </div>
  );
}

export default PaymentCard;
