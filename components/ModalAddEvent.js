import styles from "../styles/ModalAddEvent.module.css";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addEventToStore } from "../reducers/planning";
import { getPayments } from "../reducers/payments";

import moment from "moment";

export default function ModalAddEvent({ onClose, start, end }) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [structure, setStructure] = useState("");
  const [location, setLocation] = useState("");
  const [student, setStudent] = useState("");
  const dispatch = useDispatch();
  const studentsData = useSelector((state) => state.students.value);
  const [structuresData, setStructuresData] = useState([]);

  useEffect(() => {
    (async () => {
      // Fetch structures
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/teachers/getStructures`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();
        console.log("data structures", data);
        // Version dès que backend ok
        data.result
          ? setStructuresData(data.structures)
          : console.log(data.error);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, []);

  const handleAdd = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lessons/addEvent`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            desc,
            start,
            end,
            structure,
            location,
            student,
          }),
        },
      );

      const data = await response.json();

      if (data.result) {
        dispatch(addEventToStore(data.lesson));

        // refresh immédiat des factures
        const invoicesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/invoices/getInvoices`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        const invoicesData = await invoicesResponse.json();

        if (invoicesData.result) {
          dispatch(getPayments(invoicesData.invoices || []));
        }

        onClose();
      } else {
        console.log(data.error);
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const studentsChoice = studentsData.map((data, i) => {
    return (
      <>
        <option key={i} value={data.id}>
          {data.firstName} {data.lastName}
        </option>
      </>
    );
  });

  const structuresChoice = structuresData.map((data, i) => {
    return (
      <>
        <option key={i} value={data.name}>
          {data.name}
        </option>
      </>
    );
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>Ajouter un évènement</h2>
          <button className={styles.close} onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className={styles.content}>
          <div className={styles.date}>
            Début : {moment(start).format("Do MMM YYYY, hh:mm a")}
          </div>
          <div className={styles.date}>
            Fin : {moment(end).format("Do MMM YYYY, hh:mm a")}
          </div>
          <input
            className={styles.input}
            type="text"
            placeholder="Titre de l'évènement"
            maxLength="25"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <select
            className={styles.selectList}
            type="text"
            value={student}
            onChange={(e) => setStudent(e.target.value)}
          >
            <option value="">Choisir un élève</option>
            {studentsChoice}
          </select>
          <select
            className={styles.selectList}
            type="text"
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
          >
            <option value="">Choisir une structure</option>
            {structuresChoice}
          </select>

          <input
            className={styles.input}
            type="text"
            placeholder="Lieu"
            maxLength="40"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Description"
            maxLength="40"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button className={styles.btnAddEvent} onClick={() => handleAdd()}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
