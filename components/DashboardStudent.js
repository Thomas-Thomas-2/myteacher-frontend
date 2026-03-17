import Head from "next/head";
import HeaderStudent from "./HeaderStudent";
import FooterStudent from "./FooterStudent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEuroSign } from "@fortawesome/free-solid-svg-icons";
import { faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { faInbox } from "@fortawesome/free-solid-svg-icons";
import BigCalendarStudent from "./BigCalendarStudent";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { api } from "../lib/api";
import { getEvents } from "../reducers/planning";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

import styles from "../styles/DashboardStudent.module.css";

function DashboardStudent() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [paymentStatus, setPaymentStatus] = useState("Aucun paiement");
  const [documentsCount, setDocumentsCount] = useState(0);
  const [nextLesson, setNextLesson] = useState("Aucun cours prévu");

  /*useEffect(() => {
    api("/users/me").then(({ ok, data }) => {
      if (!ok || !data?.result) {
        console.log(data?.error || "Erreur récupération utilisateur");
        return;
      }

      const userId = data.user?.id;

      if (!userId) {
        console.log("Aucun userId trouvé");
        return;
      }

      // Charger les cours
      api(`/lessons/getLessonsStudentById/${userId}`).then(({ ok, data }) => {
        if (!ok || !data?.result) {
          console.log(data?.error || "Erreur chargement cours élève");
          return;
        }

        dispatch(getEvents(data.lessons));
      });

      // Charger les paiements
      api(`/invoices/getInvoicesStudentById/${userId}`).then(({ ok, data }) => {
        if (!ok || !data?.result) {
          console.log(data?.error || "Erreur chargement paiements");
          return;
        }

        const invoices = data.invoices || [];

        if (invoices.some((i) => i.status === "late")) {
          setPaymentStatus("En retard");
        } else if (invoices.some((i) => i.status === "pending")) {
          setPaymentStatus("En attente");
        } else if (invoices.some((i) => i.status === "paid")) {
          setPaymentStatus("À jour");
        } else {
          setPaymentStatus("Aucun paiement");
        }
      });
    });
  }, [dispatch]);*/

  useEffect(() => {
    (async () => {
      checkIsSignin(router); //Check if user is still authenticated, if not send them back to signin

      // Charger les cours de l'étudiant connecté
      const lessonsRes = await api("/lessons/getLessonsStudent");
      if (lessonsRes.ok && lessonsRes.data?.result) {
        const lessons = lessonsRes.data.lessons || [];

        dispatch(getEvents(lessons));

        const now = new Date();
        const upcomingLessons = lessons
          .filter((lesson) => new Date(lesson.start) > now)
          .sort((a, b) => new Date(a.start) - new Date(b.start));

        if (upcomingLessons.length > 0) {
          const nextLessonDate = new Date(upcomingLessons[0].start);
          const formattedDate = nextLessonDate.toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
          });
          const formattedTime = nextLessonDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          setNextLesson(`${formattedDate} ${formattedTime}`);
        } else {
          setNextLesson("Aucun cours prévu");
        }
      } else {
        console.log(lessonsRes.data?.error || "Erreur chargement cours élève");
      }

      // Charger les paiements de l'étudiant connecté
      const invoicesRes = await api("/invoices/my");
      if (invoicesRes.ok && invoicesRes.data?.result) {
        const invoices = invoicesRes.data.invoices || [];

        if (invoices.some((i) => i.status === "late")) {
          setPaymentStatus("En retard");
        } else if (invoices.some((i) => i.status === "pending")) {
          setPaymentStatus("En attente");
        } else if (
          invoices.length > 0 &&
          invoices.every((i) => i.status === "paid")
        ) {
          setPaymentStatus("À jour");
        } else if (invoices.some((i) => i.status === "scheduled")) {
          setPaymentStatus("À venir");
        } else {
          setPaymentStatus("Aucun paiement");
        }
      } else {
        console.log(invoicesRes.data?.error || "Erreur chargement paiements");
      }

      // Charger les ressources de l'étudiant connecté
      const ressourcesRes = await api("/ressources/getRessourcesStudent");
      if (ressourcesRes.ok && ressourcesRes.data?.result) {
        setDocumentsCount((ressourcesRes.data.ressources || []).length);
      } else {
        console.log(
          ressourcesRes.data?.error || "Erreur chargement ressources",
        );
      }
    })();
  }, [dispatch]);

  return (
    <div className={styles.content1}>
      <Head>
        <title>MyTeacher - Dashboard </title>
      </Head>
      <HeaderStudent />

      <main className={styles.main}>
        <div className={styles.titlePage}>
          <p className={styles.title}>MON DASHBOARD</p>
        </div>

        <div className={styles.section}>
          <div className={styles.leftside}>
            <div className={styles.planningBox}>
              <p className={styles.subtitle}>Planning</p>

              <BigCalendarStudent />
            </div>
          </div>

          <div className={styles.rightside}>
            <div className={styles.alertBox}>
              <p className={styles.subtitle}>Alertes</p>

              <div className={styles.contenue}>
                <p>
                  <span style={{ color: "#BF99A0" }}>
                    <FontAwesomeIcon
                      icon={faEuroSign}
                      className={styles.icon}
                    />
                  </span>{" "}
                  Status paiement :
                </p>
                <p className={styles.status}>{paymentStatus}</p>
              </div>

              <div className={styles.contenue}>
                <p>
                  <span style={{ color: "#84DCCF" }}>
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className={styles.icon}
                    />
                  </span>{" "}
                  Prochain cours :
                </p>
                <p
                  style={{ backgroundColor: "#84DCCF" }}
                  className={styles.doc}
                >
                  {nextLesson}
                </p>
              </div>

              <div className={styles.contenuebot}>
                <p>
                  <span style={{ color: "#bccbe0" }}>
                    <FontAwesomeIcon icon={faInbox} className={styles.icon} />
                  </span>{" "}
                  Document mis à disposition :
                </p>
                <p className={styles.doc}>{documentsCount}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterStudent className={styles.footer} />
    </div>
  );
}

export default DashboardStudent;
