import styles from "../styles/ConversationCard.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateStudentStatus } from "../reducers/students";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
function ConversationCard(props) {
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

  const style = props.selected === true ? { backgroundColor: "#b1e3ff" } : {};

  return (
    <div
      className={styles.content}
      onClick={() => props.selectConversation(props.student.userId)}
      style={style}
    >
      <span className={styles.name}>
        {props.student.firstName} {props.student.lastName}
      </span>
      <FontAwesomeIcon className={styles.icon} icon={faEnvelope} />
    </div>
  );
}

export default ConversationCard;
