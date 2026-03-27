import styles from "../styles/ModalRemoveEvent.module.css";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { removeEventFromStore } from "../reducers/planning";
import { getPayments } from "../reducers/payments";

import moment from "moment";

export default function ModalRemoveEvent({ onClose, event }) {
  const dispatch = useDispatch();

  const handleRemove = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/removeEvent/${event.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await response.json();

      if (data.result) {
        dispatch(removeEventFromStore(event));

        // refresh des factures
        const invoicesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/getInvoices`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const invoicesData = await invoicesResponse.json();

        if (invoicesData.result) {
          dispatch(getPayments(invoicesData.invoices || []));
        }

        onClose();
      } else {
        alert(data.error);
        onClose();
      }
    } catch (error) {
      console.error("Error removing event:", error);
      alert(error);
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>Supprimer un évènement ?</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.eventInfo}>
            Début : {moment(event.start).format("Do MMM YYYY, hh:mm")}
          </div>
          <div className={styles.eventInfo}>
            Fin : {moment(event.end).format("Do MMM YYYY, hh:mm")}
          </div>
          <div className={styles.eventInfo}>Titre : {event.title}</div>

          <button
            className={styles.btnDeleteEvent}
            onClick={() => handleRemove()}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
