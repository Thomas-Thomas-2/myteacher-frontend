import { useEffect, useMemo, useRef, useState } from "react";
import { getSocket, disconnectSocket } from "../lib/socket";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/TeacherMessages.module.css";
import { useRouter } from "next/router";

export default function TeacherMessages() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [socket, setSocket] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const messagesEndRef = useRef(null);

  const selectedConversation = useMemo(() => {
    return conversations.find(
      (conv) => String(conv._id) === String(selectedConversationId),
    );
  }, [conversations, selectedConversationId]);

  useEffect(() => {
    if (!router.isReady) return;

    const { conversationId } = router.query;

    if (conversationId) {
      setSelectedConversationId(conversationId);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    const s = getSocket(token);
    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected:", s.id);
    });

    s.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    s.on("socket_error", (payload) => {
      console.error("Socket error:", payload);
    });

    return () => {
      s.off("connect");
      s.off("disconnect");
      s.off("socket_error");
      disconnectSocket();
    };
  }, [token]);

  async function fetchConversations() {
    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/conversations`,
        {
          method: "GET",
          credentials: "include",
          headers,
        },
      );

      const data = await response.json();
      console.log("GET /messages/conversations ->", data);

      if (!data.result) return;

      const list = data.conversations || [];
      setConversations(list);

      if (!list.length) {
        setMessages([]);
        return;
      }

      const queryConversationId = router.query?.conversationId;

      if (queryConversationId) {
        const exists = list.some(
          (conv) => String(conv._id) === String(queryConversationId),
        );

        if (exists) {
          setSelectedConversationId(queryConversationId);
          return;
        }
      }

      setSelectedConversationId((prev) => {
        if (prev && list.some((conv) => String(conv._id) === String(prev))) {
          return prev;
        }
        return list[0]._id;
      });
    } catch (error) {
      console.error("fetchConversations error:", error);
    }
  }

  async function fetchMessages(conversationId) {
    if (!conversationId) return;

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/messages/conversations/${conversationId}/messages`,
        {
          method: "GET",
          credentials: "include",
          headers,
        },
      );

      const data = await response.json();
      console.log("GET messages ->", data);

      if (!data.result) return;

      setMessages(data.messages || []);
    } catch (error) {
      console.error("fetchMessages error:", error);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    fetchConversations();
  }, [router.isReady, router.query.conversationId]);

  useEffect(() => {
    if (!selectedConversationId) return;
    fetchMessages(selectedConversationId);
  }, [selectedConversationId]);

  useEffect(() => {
    if (!socket || !selectedConversationId) return;

    socket.emit("join_conversation", {
      conversationId: selectedConversationId,
    });

    socket.emit("messages_read", {
      conversationId: selectedConversationId,
    });

    return () => {
      socket.emit("leave_conversation", {
        conversationId: selectedConversationId,
      });
    };
  }, [socket, selectedConversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (String(message.conversation) === String(selectedConversationId)) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) => String(m._id) === String(message._id),
          );
          if (exists) return prev;
          return [...prev, message];
        });

        socket.emit("messages_read", {
          conversationId: selectedConversationId,
        });
      }

      setConversations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex(
          (conv) => String(conv._id) === String(message.conversation),
        );

        if (index !== -1) {
          updated[index] = {
            ...updated[index],
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastSenderRole: message.senderRole,
            unreadCount:
              String(message.conversation) === String(selectedConversationId)
                ? 0
                : (updated[index].unreadCount || 0) + 1,
          };

          updated.sort((a, b) => {
            const da = a.lastMessageAt
              ? new Date(a.lastMessageAt).getTime()
              : 0;
            const db = b.lastMessageAt
              ? new Date(b.lastMessageAt).getTime()
              : 0;
            return db - da;
          });
        }

        return updated;
      });
    };

    const handleMessagesReadUpdate = ({ conversationId, readBy }) => {
      if (readBy !== "teacher") return;

      setConversations((prev) =>
        prev.map((conv) =>
          String(conv._id) === String(conversationId)
            ? { ...conv, unreadCount: 0 }
            : conv,
        ),
      );

      if (String(conversationId) === String(selectedConversationId)) {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.senderRole === "teacher") return msg;
            if ((msg.readBy || []).includes("teacher")) return msg;
            return {
              ...msg,
              readBy: [...(msg.readBy || []), "teacher"],
            };
          }),
        );
      }
    };

    const handleConversationUpdated = ({
      conversationId,
      lastMessage,
      lastMessageAt,
      lastSenderRole,
    }) => {
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          String(conv._id) === String(conversationId)
            ? {
                ...conv,
                lastMessage,
                lastMessageAt,
                lastSenderRole,
              }
            : conv,
        );

        updated.sort((a, b) => {
          const da = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const db = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return db - da;
        });

        return updated;
      });
    };

    const handleNotification = () => {
      fetchConversations();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read_update", handleMessagesReadUpdate);
    socket.on("conversation_updated", handleConversationUpdated);
    socket.on("new_message_notification", handleNotification);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read_update", handleMessagesReadUpdate);
      socket.off("conversation_updated", handleConversationUpdated);
      socket.off("new_message_notification", handleNotification);
    };
  }, [socket, selectedConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSendMessage() {
    if (!socket || !selectedConversationId || !input.trim()) return;

    socket.emit("send_message", {
      conversationId: selectedConversationId,
      content: input.trim(),
    });

    setInput("");
  }

  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className={styles.page}>
      <HeaderTeacher />

      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>Conversations</div>

          {!conversations.length ? (
            <div className={styles.emptySidebar}>
              Aucune conversation pour le moment.
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv._id}
                onClick={() => setSelectedConversationId(conv._id)}
                className={`${styles.conversationButton} ${
                  String(conv._id) === String(selectedConversationId)
                    ? styles.activeConversation
                    : ""
                }`}
              >
                <div className={styles.conversationTop}>
                  <div className={styles.conversationName}>
                    {conv.studentName || "Élève"}
                  </div>
                  <div className={styles.conversationTime}>
                    {formatDate(conv.lastMessageAt)}
                  </div>
                </div>

                <div className={styles.conversationPreview}>
                  {conv.lastMessage || "Aucun message"}
                </div>

                {!!conv.unreadCount && (
                  <div className={styles.unreadBadge}>{conv.unreadCount}</div>
                )}
              </button>
            ))
          )}
        </aside>

        <section className={styles.main}>
          <div className={styles.mainHeader}>
            <div className={styles.mainTitle}>
              {selectedConversation?.studentName ||
                "Sélectionne une conversation"}
            </div>
            <div className={styles.mainSubtitle}>
              Messagerie professeur ↔ élève
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {!selectedConversationId ? (
              <div className={styles.emptyMessages}>
                Choisis une conversation dans la colonne de gauche.
              </div>
            ) : !messages.length ? (
              <div className={styles.emptyMessages}>
                Aucun message pour le moment.
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.senderRole === "teacher";

                return (
                  <div
                    key={msg._id}
                    className={`${styles.messageRow} ${
                      isMine ? styles.mine : styles.theirs
                    }`}
                  >
                    <div
                      className={`${styles.messageBubble} ${
                        isMine ? styles.myBubble : styles.theirBubble
                      }`}
                    >
                      <div className={styles.messageText}>{msg.content}</div>
                      <div className={styles.messageMeta}>
                        {new Date(msg.createdAt).toLocaleString("fr-FR")}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.composer}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                selectedConversationId
                  ? "Écrire un message..."
                  : "Choisis d'abord un élève pour démarrer une conversation"
              }
              className={styles.input}
              disabled={!selectedConversationId}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className={styles.sendButton}
              disabled={!input.trim() || !selectedConversationId}
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
