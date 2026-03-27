import styles from "../styles/ConversationCard.module.css";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { updateStudentStatus } from "../reducers/students";
import Link from "next/link";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

function ConversationCard(props) {
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
