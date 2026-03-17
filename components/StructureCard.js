import styles from "../styles/StructureCard.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function StructureCard(props) {
  return (
    <div className={styles.content}>
      <div className={styles.title}>
        <div>{props.name}</div>
        <FontAwesomeIcon
          className={styles.icon}
          icon={faTrash}
          onClick={() => props.deleteFct(props)}
        />
      </div>
      <div className={styles.structureData}>
        <div className={styles.detailsBlock}>
          <div className={styles.blockTitle}>Volume horaire</div>
          <div className={styles.blockInfo}>
            {props.weekWorkLoad}h / semaine
          </div>
        </div>
        <div className={styles.detailsBlock}>
          <div className={styles.blockTitle}>Frais</div>
          <div className={styles.blockInfo}>
            Location de salle : {props.feesPlace}€ / mois
          </div>
          <div className={styles.blockInfo}>
            Comptabilité : {props.accountability}€ / mois
          </div>
        </div>
        <div className={styles.detailsBlock}>
          <div className={styles.blockTitle}>Revenus</div>
          <div className={styles.blockInfo}>{props.income}€ / mois</div>
        </div>
      </div>
    </div>
  );
}

export default StructureCard;
