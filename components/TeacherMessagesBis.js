import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "../lib/socket";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/TeacherMessagesBis.module.css";
import { useRouter } from "next/router";
const { checkIsSignin } = require("../modules/checkRole");
import ConversationCard from "./ConversationCard";
import Pusher from "pusher-js";

export default function TeacherMessagesBis() {
  const router = useRouter();
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [students, setStudents] = useState([]);
  const [user, setUser] = useState("");

  // Load students at mounting
  useEffect(() => {
    (async () => {
      await checkIsSignin(router);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/students/getStudents`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        if (data.result) {
          setStudents(data.students);
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
    })();
  }, []);

  useEffect(() => {
    if (!selectedStudentId || !user) {
      return;
    }
    // fetch messages regarding this student
    (async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/messagesBis/${selectedStudentId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        console.log("messages", data);
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
    const channel = pusher.subscribe(`channel-${user}-${selectedStudentId}`);
    channel.bind("new-message", (data) => {
      setMessages((oldMessages) => [...oldMessages, data.message]);
    });

    return () => {
      channel.unbind();
      channel.unsubscribe(`channel-${user}-${selectedStudentId}`);
    };
  }, [selectedStudentId, user]);

  const handleSendMessage = async () => {
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
            studentId: selectedStudentId,
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

  const selectConversation = async (studentId) => {
    setSelectedStudentId(studentId);
  };

  const conversationList = students.map(
    (data, i) =>
      data.status === "Actif" && (
        <ConversationCard
          key={i}
          student={data}
          selectConversation={selectConversation}
          selected={data.userId === selectedStudentId ? true : false}
        />
      ),
  );

  const messageList = messages.map((data, i) =>
    data.senderUser === user ? (
      <div key={i} className={styles.teacherMessage}>
        {data.content}
      </div>
    ) : (
      <div key={i} className={styles.studentMessage}>
        {data.content}
      </div>
    ),
  );

  return (
    <div className={styles.page}>
      <HeaderTeacher />

      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Conversations</div>
          {conversationList}
        </aside>

        <section className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.mainTitle}>Sélectionne une conversation</div>
            <div className={styles.mainSubtitle}>
              Messagerie professeur ↔ élève
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
              placeholder={
                selectedStudentId
                  ? "Écrire un message..."
                  : "Choisis d'abord un élève pour démarrer une conversation"
              }
              className={styles.input}
              disabled={!selectedStudentId}
            />
            <button
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!input.trim() || !selectedStudentId}
            >
              Envoyer
            </button>
          </div>
        </section>
      </div>

      <FooterTeacher />
    </div>
  );
}
