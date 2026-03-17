import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import styles from "../styles/FicheStudentTeacher.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useRef, useMemo, useEffect, useState } from "react";
import { api } from "../lib/api";
import { getStudents } from "../reducers/students";
import { getPayments } from "../reducers/payments";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

function FicheStudentTeacher({ studentId }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const structureRef = useRef(null);

  const typeRef = useRef(null);
  const priceRef = useRef(null);
  const modaliteRef = useRef(null);

  const [structures, setStructures] = useState([]);
  const [selectedStructure, setSelectedStructure] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedModalite, setSelectedModalite] = useState("");
  const [studentPayments, setStudentPayments] = useState([]);
  const [studentLessons, setStudentLessons] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState("");

  const [identityMessage, setIdentityMessage] = useState("");
  const [formulaMessage, setFormulaMessage] = useState("");

  const payments = useSelector((state) => state.payments.value);
  const lessons = useSelector((state) => state.planning.value);

  const students = useSelector((state) => state.students.value);
  const student = students.find((student) => student.id == studentId);

  const prenom = student?.firstName || "";
  const nom = student?.lastName || "";
  const email = student?.email || "";
  const tel = student?.phone || "";

  const type_abonnement = student?.subscription?.type || "";
  const price = student?.subscription?.price ?? "";
  const modalite = student?.subscription?.modalite || "";

  useEffect(() => {
    checkIsSignin(router); //Check if user is still authenticated, if not send them back to signin

    api("/teachers/getStructures").then(({ ok, data }) => {
      if (!ok || !data.result) {
        console.log(data.error || "Erreur récupération structures");
        return;
      }

      setStructures(data.structures || []);
      setDisciplines(data.disciplines || []);
    });
  }, [router]);

  useEffect(() => {
    setSelectedStructure(student?.structure || "");
    setSelectedDiscipline(
      Array.isArray(student?.discipline)
        ? student.discipline[0] || ""
        : student?.discipline || "",
    );
  }, [student]);

  useEffect(() => {
    setSelectedType(student?.subscription?.type || "");
    setSelectedModalite(student?.subscription?.modalite || "");
  }, [student]);

  useEffect(() => {
    if (!studentId) return;

    api(`/invoices/getInvoicesStudentById/${studentId}`).then(
      ({ ok, data }) => {
        if (!ok || !data.result) {
          console.log(data.error || "Erreur récupération paiements élève");
          return;
        }

        setStudentPayments(data.invoices || []);
      },
    );
  }, [studentId]);

  useEffect(() => {
    if (!studentId) return;

    api(`/lessons/getLessonsStudentById/${studentId}`).then(({ ok, data }) => {
      if (!ok || !data.result) {
        console.log(data.error || "Erreur récupération cours élève");
        return;
      }

      setStudentLessons(data.lessons || []);
    });
  }, [studentId]);

  const cours = useMemo(() => {
    return studentLessons.map((lesson) => {
      const date = new Date(lesson.start);

      const dateString = date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const hourString = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return {
        date: `${dateString} ${hourString}`,
        status: "Ok",
      };
    });
  }, [studentLessons]);

  function refreshStudents() {
    api("/students/getStudents").then(({ ok, data }) => {
      if (!ok || !data.result) {
        console.log(data.error || "Erreur refresh students");
        return;
      }

      dispatch(getStudents(data.students));
    });
  }

  function handleUpdateIdentity() {
    setIdentityMessage("");

    const body = {
      studentId,
      firstName: firstNameRef.current.value,
      lastName: lastNameRef.current.value,
      email: emailRef.current.value,
      phone: phoneRef.current.value,
      structure: selectedStructure,
      discipline: selectedDiscipline,
    };

    api("/students/updateIdentity", {
      method: "PUT",
      body,
    }).then(({ ok, data }) => {
      if (!ok || !data.result) {
        setIdentityMessage(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      setIdentityMessage("Informations enregistrées avec succès");
      refreshStudents();

      api(`/invoices/getInvoicesStudentById/${studentId}`).then(
        ({ ok, data }) => {
          if (!ok || !data.result) {
            console.log(data.error || "Erreur refresh payments");
            return;
          }

          setStudentPayments(data.invoices || []);
        },
      );
    });
  }

  function handleUpdateFormula() {
    setFormulaMessage("");

    const body = {
      studentId,
      type: selectedType,
      price: Number(priceRef.current.value),
      modalite: selectedModalite,
    };

    api("/students/updateSubscription", {
      method: "PUT",
      body,
    }).then(({ ok, data }) => {
      if (!ok || !data.result) {
        setFormulaMessage(data?.error || "Erreur lors de la mise à jour");
        return;
      }

      setFormulaMessage("Formule enregistrée avec succès");
      refreshStudents();
    });
  }

  if (!student) {
    return (
      <div className={styles.page}>
        <HeaderTeacher />
        <main className={styles.main}>
          <p>Élève introuvable</p>
        </main>
        <FooterTeacher />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <HeaderTeacher />

      <main className={styles.main}>
        <div className={styles.titlePage}>
          <h1 className={styles.titre}>
            {prenom} {nom}
          </h1>
        </div>

        <div className={styles.section}>
          <div className={styles.leftColumn}>
            <div className={styles.identitySection}>
              <p className={styles.subtitle}>Identité</p>

              <div className={styles.cardContent}>
                <div className={styles.field}>
                  <label className={styles.label}>Prénom</label>
                  <span className={styles.separator}>:</span>
                  <input
                    ref={firstNameRef}
                    className={styles.input}
                    type="text"
                    defaultValue={prenom}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Nom</label>
                  <span className={styles.separator}>:</span>
                  <input
                    ref={lastNameRef}
                    className={styles.input}
                    type="text"
                    defaultValue={nom}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <span className={styles.separator}>:</span>
                  <input
                    ref={emailRef}
                    className={styles.input}
                    type="email"
                    defaultValue={email}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Contact</label>
                  <span className={styles.separator}>:</span>
                  <input
                    ref={phoneRef}
                    className={styles.input}
                    type="tel"
                    defaultValue={tel}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Discipline</label>
                  <span className={styles.separator}>:</span>
                  <select
                    className={styles.select}
                    value={selectedDiscipline}
                    onChange={(e) => setSelectedDiscipline(e.target.value)}
                  >
                    <option value="">Choisir une discipline</option>
                    {disciplines.map((discipline, index) => (
                      <option key={index} value={discipline}>
                        {discipline}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Structure</label>
                  <span className={styles.separator}>:</span>
                  <select
                    ref={structureRef}
                    className={styles.select}
                    value={selectedStructure}
                    onChange={(e) => setSelectedStructure(e.target.value)}
                  >
                    <option value="">Choisir une structure</option>
                    {structures.map((structure) => (
                      <option key={structure._id} value={structure.name}>
                        {structure.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    className={styles.bouton}
                    type="button"
                    onClick={handleUpdateIdentity}
                  >
                    Modifier
                  </button>
                </div>

                {identityMessage && (
                  <p className={styles.message}>{identityMessage}</p>
                )}
              </div>
            </div>

            <div className={styles.formuleSection}>
              <p className={styles.subtitle}>Formule</p>

              <div className={styles.cardContent}>
                <div className={styles.field}>
                  <label className={styles.label}>Type</label>
                  <span className={styles.separator}>:</span>
                  <select
                    ref={typeRef}
                    className={styles.select}
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="">Choisir un type</option>
                    <option value="A l'unité">A l'unité</option>
                    <option value="Trimestre">Trimestre</option>
                    <option value="Annuel">Annuel</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Prix</label>
                  <span className={styles.separator}>:</span>
                  <input
                    ref={priceRef}
                    className={styles.input}
                    type="number"
                    defaultValue={price}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Modalité</label>
                  <span className={styles.separator}>:</span>
                  <select
                    ref={modaliteRef}
                    className={styles.select}
                    value={selectedModalite}
                    onChange={(e) => setSelectedModalite(e.target.value)}
                  >
                    <option value="">Choisir une modalité</option>
                    <option value="Paiement 1 fois">Paiement 1 fois</option>
                    <option value="Paiement 3 fois">Paiement 3 fois</option>
                  </select>
                </div>

                <div className={styles.buttonContainer}>
                  <button
                    className={styles.bouton}
                    type="button"
                    onClick={handleUpdateFormula}
                  >
                    Modifier
                  </button>
                </div>

                {formulaMessage && (
                  <p className={styles.message}>{formulaMessage}</p>
                )}
              </div>
            </div>
          </div>

          <div className={styles.middleColumn}>
            <div className={styles.cardSectionTall}>
              <p className={styles.subtitle}>Historique de paiement</p>

              <div className={styles.scrollContent}>
                {studentPayments.length === 0 ? (
                  <p className={styles.emptyState}>Aucun paiement enregistré</p>
                ) : (
                  studentPayments.map((paiement, index) => (
                    <div key={paiement.id ?? index} className={styles.rowItem}>
                      <p className={styles.rowLabel}>Paiement {index + 1}</p>
                      <p className={styles.rowDate}>
                        {paiement.period ?? "Pas de date entrée en bdd"}
                      </p>

                      {paiement.status === "late" ? (
                        <p className={styles.rouge}>Retard</p>
                      ) : paiement.status === "pending" ? (
                        <p className={styles.orange}>En attente</p>
                      ) : paiement.status === "scheduled" ? (
                        <p className={styles.orange}>À venir</p>
                      ) : paiement.status === "paid" ? (
                        <p className={styles.vert}>Payé</p>
                      ) : (
                        <p className={styles.vert}>Ok</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.cardSectionTall}>
              <p className={styles.subtitle}>Suivi des cours</p>

              <div className={styles.scrollContent}>
                {cours.length === 0 ? (
                  <p className={styles.emptyState}>Aucun cours enregistré</p>
                ) : (
                  cours.map((cour, index) => (
                    <div key={index} className={styles.rowItem}>
                      <p className={styles.rowLabel}>Cours {index + 1}</p>
                      <p className={styles.rowDate}>{cour.date}</p>

                      {cour.status === "Annulé" ? (
                        <p className={styles.rouge}>Annulé</p>
                      ) : (
                        <p className={styles.vert}>Ok</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterTeacher />
    </div>
  );
}

export default FicheStudentTeacher;
