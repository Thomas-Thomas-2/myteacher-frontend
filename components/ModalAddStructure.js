import styles from "../styles/ModalAddStructure.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faFileCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function ModalAddRessource({ onClose, addStructureFct }) {
  const [name, setName] = useState("");
  const [weekWorkLoad, setWeekWorkLoad] = useState(null);
  const [feesPlace, setFeesPlace] = useState("");
  const [accountability, setAccountability] = useState("");
  const [income, setIncome] = useState("");

  const handleAdd = () => {
    if (!name || !weekWorkLoad || !feesPlace || !accountability || !income) {
      console.log("Data missing in form");
    } else {
      addStructureFct({
        name,
        weekWorkLoad,
        feesPlace,
        accountability,
        income,
      });
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>Ajouter une structure</h2>
          <FontAwesomeIcon
            className={styles.close}
            icon={faXmark}
            onClick={onClose}
          />
        </div>
        <div className={styles.content}>
          <input
            className={styles.input}
            type="text"
            placeholder="Nom de la structure"
            maxLength="35"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Charge horaire hebdomadaire"
            value={weekWorkLoad}
            onChange={(e) => setWeekWorkLoad(e.target.value)}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Frais de location de salle mensuels"
            value={feesPlace}
            onChange={(e) => setFeesPlace(e.target.value)}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Frais de comptabilité mensuels"
            value={accountability}
            onChange={(e) => setAccountability(e.target.value)}
          />
          <input
            className={styles.input}
            type="number"
            placeholder="Revenus mensuels"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />

          <button className={styles.btn} onClick={() => handleAdd()}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
