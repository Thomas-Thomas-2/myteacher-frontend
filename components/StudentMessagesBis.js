import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "../lib/socket";
import HeaderStudent from "./HeaderStudent";
import FooterStudent from "./FooterStudent";
import styles from "../styles/StudentMessagesBis.module.css";
import { useRouter } from "next/router";
const { checkIsSignin } = require("../modules/checkRole");
import ConversationCard from "./ConversationCard";
import Pusher from "pusher-js";
import moment from "moment";

export default function StudentMessagesBis() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [teacher, setTeacher] = useState("");
  const [user, setUser] = useState("");

  // Set conversation settings at mounting : teacher, userId and messages
  useEffect(() => {
    (async () => {
      await checkIsSignin(router);
      // Get teacher
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        if (data.result) {
          setTeacher(data.student.teacher);
        }

        // Get current user id
        const responseUser = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const dataUser = await responseUser.json();
        if (dataUser.result) {
          setUser(dataUser.user.id);
        }
      } catch (error) {
        console.error("Error getting current user:", error);
        alert(error);
      }

      // Get messages history
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/messagesBis`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        if (data.result) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        alert(error);
      }
    })();
    // connect to pusher
    const pusher = new Pusher(process.env.NEXT_PUBLIC_KEY, { cluster: "eu" });
    const channel = pusher.subscribe(`channel-${teacher}-${user}`);
    channel.bind("new-message", (data) => {
      setMessages((oldMessages) => [...oldMessages, data.message]);
    });

    return () => {
      channel.unbind();
      channel.unsubscribe(`channel-${teacher}-${user}`);
    };
  }, [teacher, user]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/messagesBis`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            teacherId: teacher,
            content: input,
          }),
        },
      );
      const data = await response.json();
      if (!data.result) {
        alert(data.error);
      }
      setInput("");
    } catch (error) {
      console.error("Error posting messages:", error);
      alert(error);
    }
  };

  const messageList = messages.map((data, i) =>
    data.senderUser === user ? (
      <div key={i} className={styles.studentMessage}>
        <span className={styles.dateMessage}>
          {moment(data.createdAt).format("D MMM YYYY, hh:mm a")} - Toi :
        </span>{" "}
        <br />
        {data.content}
      </div>
    ) : (
      <div key={i} className={styles.teacherMessage}>
        <span className={styles.dateMessage}>
          {moment(data.createdAt).format("D MMM YYYY, hh:mm a")} - Ton
          professeur :
        </span>{" "}
        <br />
        {data.content}
      </div>
    ),
  );

  return (
    <div className={styles.page}>
      <HeaderStudent />

      <div className={styles.wrapper}>
        <section className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.mainTitle}>
              Conversation avec ton professeur
            </div>
            <div className={styles.mainSubtitle}>
              Messagerie élève ↔ professeur
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {messageList}
            <div />
          </div>

          <div className={styles.composer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={"Écrire un message..."}
              className={styles.input}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!input.trim()}
            >
              Envoyer
            </button>
          </div>
        </section>
      </div>

      <FooterStudent />
    </div>
  );
}
