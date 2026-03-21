import Head from "next/head";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import StudentCard from "./StudentCard";
import PaymentCard from "./PaymentCard";
import BigCalendar from "./BigCalendar";
import ModalAddStudent from "./ModalAddStudent";
import ModalCreateStudent from "./ModalCreateStudent";
import Loading from "./Loading";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getEvents, addEventToStore } from "../reducers/planning";
import { getStudents, addStudentToStore } from "../reducers/students";
import { getPayments } from "../reducers/payments";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

import styles from "../styles/DashboardTeacher.module.css";

function DashboardTeacher() {
  const router = useRouter();
  const [modalAddStudent, setModalAddStudent] = useState(false);
  const [modalCreateStudent, setModalCreateStudent] = useState(false);
  const [loading, setLoading] = useState(false);
  const studentsData = useSelector((state) => state.students.value);
  const paymentsData = useSelector((state) => state.payments.value);
  const dispatch = useDispatch();

  // connexion modal invite student dans la liste des students
  const [selectedStudent, setSelectedStudent] = useState(null);
  const openInviteModal = (student) => {
    setSelectedStudent(student);
    setModalAddStudent(true);
  };

  useEffect(() => {
    setLoading(true);
    (async () => {
      await checkIsSignin(router);

      let hasStudents = false;
      let hasPayments = false;
      let hasEvents = false;
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
          dispatch(getStudents(data.students));
          hasStudents = true;
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/getInvoices`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        if (data.result) {
          dispatch(getPayments(data.invoices));
          hasPayments = true;
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/getLessons`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const data = await response.json();
        if (data.result) {
          dispatch(getEvents(data.lessons));
          hasEvents = true;
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lessons:", error);
      }
    })();
  }, [dispatch, router]);

  const students = (Array.isArray(studentsData) ? studentsData : [])
    .filter(Boolean)
    .map((data, i) => (
      <StudentCard
        key={data.id || i}
        id={data.id}
        firstname={data.firstName || ""}
        lastname={data.lastName || ""}
        discipline={data.discipline || ""}
        invite={(data.status || "Prospect") === "Prospect"}
        status={data.status || "Prospect"}
        subscription={
          typeof data.subscription === "string"
            ? data.subscription
            : data.subscription?.type || ""
        }
        email={data.email || ""}
        onInviteClick={() => openInviteModal(data)}
      />
    ));

  const payments = (Array.isArray(paymentsData) ? paymentsData : [])
    .filter(Boolean)
    .filter((data) => {
      const paymentDate = data.dueAt || data.createdAt;
      if (!paymentDate) return data.status === "late";

      const date = new Date(paymentDate);
      const now = new Date();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);

      // toujours garder les retards
      if (data.status === "late") return true;

      // pour les autres statuts, seulement les 30 derniers jours
      return date >= thirtyDaysAgo;
    })
    .sort((a, b) => {
      // les retards d'abord
      if (a.status === "late" && b.status !== "late") return -1;
      if (a.status !== "late" && b.status === "late") return 1;

      // puis les plus récents
      const dateA = new Date(a.dueAt || a.createdAt || 0);
      const dateB = new Date(b.dueAt || b.createdAt || 0);
      return dateB - dateA;
    })
    .map((data, i) => (
      <PaymentCard
        key={data._id || data.id || i}
        firstname={data.firstName || ""}
        lastname={data.lastName || ""}
        discipline={data.discipline || ""}
        date={data.dueAt || data.createdAt || null}
        amount={data.amount || 0}
        status={data.status || ""}
      />
    ));

  return (
    <div className={styles.content}>
      <Head>
        <title>MyTeacher - Dashboard </title>
      </Head>
      <HeaderTeacher />

      <main className={styles.main}>
        <div className={styles.titlePage}>
          <p className={styles.title}>MON DASHBOARD</p>
        </div>
        <div className={styles.section}>
          <div className={styles.leftSection}>
            <div className={styles.studentSection}>
              <p className={styles.subtitle}>Mes élèves</p>
              <button
                className={styles.addStudentBtn}
                onClick={() => setModalCreateStudent(true)}
              >
                <span className={styles.addText}>+ Ajouter un élève</span>
              </button>
              <div className={styles.studentList}>{students}</div>
            </div>
            <div className={styles.paymentSection}>
              <p className={styles.subtitle}>Suivi paiements</p>
              <div className={styles.paymentList}>{payments}</div>
            </div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.planningSection}>
              <p className={styles.subtitle}>Planning</p>

              <div className={styles.planningDetails}>
                <BigCalendar />
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterTeacher />
      {modalCreateStudent && (
        <ModalCreateStudent
          onClose={() => setModalCreateStudent(false)}
          onCreated={(data) => {
            setModalCreateStudent(false);

            if (data?.student) {
              dispatch(addStudentToStore(data.student));
              setSelectedStudent(data.student);
              setModalAddStudent(true);
            }
          }}
        />
      )}
      {modalAddStudent && (
        <ModalAddStudent
          student={selectedStudent}
          onClose={() => setModalAddStudent(false)}
          onInvited={() => setModalAddStudent(false)}
        />
      )}
    </div>
  );
}

export default DashboardTeacher;
