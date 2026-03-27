import Head from "next/head";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import StructureCard from "./StructureCard";
import ModalAddStructure from "./ModalAddStructure";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import styles from "../styles/StructuresTeacher.module.css";

function StructuresTeacher() {
  const [structuresData, setStructuresData] = useState([]);
  const [modalAddStructure, setModalAddStructure] = useState(false);
  const [addFlag, setAddFlag] = useState(false);

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
  }, [addFlag]);

  const deleteStructure = async (comingProps) => {
    // Fetch delete ressource
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/teachers/deleteStructure/${comingProps._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      // Version dès que backend ok
      data.result
        ? setStructuresData((ress) =>
            ress.filter((r) => r._id !== comingProps._id),
          )
        : console.log(data.error);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleAddStructure = async (newStructure) => {
    if (
      newStructure.name !== "" &&
      newStructure.weekHourLoad !== "" &&
      newStructure.feesPlace !== "" &&
      newStructure.accountability !== "" &&
      newStructure.income !== ""
    ) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/teachers/addStructure`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: newStructure.name,
              weekWorkLoad: newStructure.weekWorkLoad,
              feesPlace: newStructure.feesPlace,
              accountability: newStructure.accountability,
              income: newStructure.income,
            }),
          },
        );

        const data = await response.json();
        console.log("Data structures fetched:", data);

        if (data.result) {
          alert("Structure ajoutée !");
          setAddFlag(!addFlag);
        } else {
          alert(`Erreur : ${data.error}`);
        }
      } catch (error) {
        console.error("Error adding structure :", error);
      }
    } else {
      console.log("Input data missing");
    }
  };

  const structures = structuresData?.map((data, i) => (
    <StructureCard
      key={i}
      _id={data._id}
      name={data.name}
      weekWorkLoad={data.weekWorkLoad}
      feesPlace={data.feesPlace}
      accountability={data.accountability}
      income={data.income}
      deleteFct={deleteStructure}
    />
  ));

  return (
    <div className={styles.content}>
      <Head>
        <title>MyTeacher - Structures </title>
      </Head>
      <HeaderTeacher />
      <main className={styles.main}>
        <div className={styles.titlePage}>
          <p className={styles.title}>MES STRUCTURES</p>
        </div>
        <div className={styles.section}>
          <p className={styles.subtitle}>Mes structures</p>
          <button
            className={styles.btn}
            onClick={() => setModalAddStructure(true)}
          >
            <span className={styles.addText}>+ Ajouter</span>
          </button>
          <div className={styles.structuresList}>{structures}</div>
        </div>
      </main>
      <FooterTeacher />
      {modalAddStructure && (
        <ModalAddStructure
          onClose={() => setModalAddStructure(false)}
          addStructureFct={handleAddStructure}
        />
      )}
    </div>
  );
}

export default StructuresTeacher;
