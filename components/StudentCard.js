import styles from "../styles/StudentCard.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateStudentStatus } from "../reducers/students";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function StudentCard(props) {
  const router = useRouter();
  const [status, setStatus] = useState(props.status || "");
  const [isOpeningConversation, setIsOpeningConversation] = useState(false);

  useEffect(() => {
    setStatus(props.status || "");
  }, [props.status]);

  const dispatch = useDispatch();

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/changeStatus`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: props.id,
            status: newStatus,
          }),
        },
      );

      const data = await response.json();
      data.result
        ? dispatch(updateStudentStatus({ id: props.id, status: newStatus }))
        : alert(data.error);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Issue while updating status.");
    }
  };

  return (
    <div className={styles.content}>
      <div className={styles.nameBlock}>
        <button
          type="button"
          className={styles.studentLink}
          onClick={() => router.push(`/fiche_student_teacher?id=${props.id}`)}
        >
          <span className={styles.name}>
            {props.firstname} {props.lastname}
          </span>
        </button>
      </div>

      <p className={styles.discipline}>{props.discipline}</p>

      {status === "Prospect" && (
        <button
          className={styles.inviteBtn}
          type="button"
          onClick={() => props.onInviteClick?.(props.email)}
          disabled={!props.email}
          title={!props.email ? "Email manquant" : "Inviter cet élève"}
        >
          <span className={styles.inviteText}>
            {props.email ? "Inviter" : "Email manquant"}
          </span>
        </button>
      )}
      <select
        className={styles.selectList}
        value={status}
        onChange={(e) => handleStatusChange(e.target.value)}
      >
        <option value="" disabled hidden>
          Choisir une option
        </option>
        <option value="Actif">Actif</option>
        <option value="Inactif">Inactif</option>
        <option value="Prospect">Prospect</option>
      </select>
      <p className={styles.subscription}>{props.subscription || "A définir"}</p>
    </div>
  );
}

export default StudentCard;
