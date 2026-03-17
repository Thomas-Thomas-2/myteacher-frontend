import styles from "../styles/Loading.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

export default function Loading() {
  return (
    <div className={styles.overlay}>
      <FontAwesomeIcon className={styles.icon} icon={faCircleNotch} />
    </div>
  );
}
