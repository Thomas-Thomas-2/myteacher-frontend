import Head from "next/head";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import RessourceCard from "./RessourceCard";
import ModalAddRessource from "./ModalAddRessource";
import Loading from "./Loading";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

import styles from "../styles/RessourcesTeacher.module.css";

const dataRessources = [
  {
    id: 1,
    title: "Fly me to the moon",
    type: "Partition",
  },
  {
    id: 2,
    title: "Pouette",
    type: "Partition",
  },
  {
    id: 3,
    title: "Sous le vent",
    type: "Partition",
  },
];

function RessourcesTeacher() {
  const router = useRouter();
  const [ressourcesData, setRessourcesData] = useState([]);
  const [sharingRessources, setSharingRessources] = useState([]);
  const studentsData = useSelector((state) => state.students.value);
  const [students, setStudents] = useState([]);
  const [modalAddRessource, setModalAddRessource] = useState(false);
  const [addFlag, setAddFlag] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    (async () => {
      checkIsSignin(router); //Check if user is still authenticated, if not send them back to signin
      (async () => {})();
      // Fetch ressources
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/getRessources`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data = await response.json();
        // Version dès que backend ok
        data.result
          ? setRessourcesData(data.ressources)
          : console.log(data.error);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    })();
  }, [addFlag]);

  const addToSharingList = (comingProps) => {
    if (!sharingRessources.some((ress) => ress._id === comingProps._id)) {
      setSharingRessources((ress) => [
        ...ress,
        { ...comingProps, share: true },
      ]);
    }
  };

  const deleteRessource = async (comingProps) => {
    console.log("Supprimer ressource", comingProps._id);
    // Fetch delete ressource
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/deleteRessource/${comingProps._id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const data = await response.json();
      console.log("Data ressources fetched:", data);
      // Version dès que backend ok
      data.result
        ? setRessourcesData((ress) =>
            ress.filter((r) => r._id !== comingProps._id),
          )
        : console.log(data.error);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const removeFromSharingList = (comingProps) => {
    setSharingRessources((ress) =>
      ress.filter((r) => r._id !== comingProps._id),
    );
  };

  const shareRessources = async () => {
    // Fetch vers backend pour partager les ressources
    if (students.length > 0 && sharingRessources.length > 0) {
      console.log("students", students);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/share`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ressources: sharingRessources,
              students,
            }),
          },
        );
        const data = await response.json();
        console.log("Data ressources fetched:", data);
        // Version dès que backend ok
        data.result
          ? (setSharingRessources([]),
            setStudents([]),
            alert("Ressources partagées !"))
          : console.log(data.error);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  const handleAddRessource = async (newRessource) => {
    console.log("Ajouter ressource", newRessource);
    if (
      newRessource.title !== "" &&
      newRessource.tag !== "" &&
      newRessource.file !== ""
    ) {
      const formData = new FormData();
      formData.append("file", newRessource.file);
      formData.append("title", newRessource.title);
      formData.append("tag", newRessource.tag);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/add`,
          {
            method: "POST",
            credentials: "include",
            // headers: {
            //   "Content-Type": "application/json",
            //   // Authorization: `Bearer ${token}`,
            // },
            body: formData,
          },
        );

        const data = await response.json();
        console.log("Data ressources fetched:", data);

        if (data.result) {
          alert("Ressource ajoutée !");
          setAddFlag(!addFlag);
        } else {
          alert(`Erreur : ${data.error}`);
        }
      } catch (error) {
        console.error("Error adding ressource :", error);
      }
    } else {
      console.log("Input data missing");
    }
  };

  const ressources = ressourcesData?.map((data, i) => (
    <RessourceCard
      key={i}
      _id={data._id}
      title={data.title}
      tags={data.tags[0]}
      addToSharingFct={addToSharingList}
      deleteFct={deleteRessource}
      removeFct={removeFromSharingList}
      share={false}
      url={data.url}
    />
  ));

  const ressourcesToShare = sharingRessources?.map((data, i) => (
    <RessourceCard
      key={i}
      _id={data._id}
      title={data.title}
      tags={data.tags}
      onClick={addToSharingList}
      delete={deleteRessource}
      removeFct={removeFromSharingList}
      share={true}
    />
  ));

  const studentsChoice = studentsData.map((data, i) => {
    return (
      <option key={i} value={data.id}>
        {data.firstName} {data.lastName}
      </option>
    );
  });

  return (
    <div className={styles.content}>
      <Head>
        <title>MyTeacher - Ressources </title>
      </Head>
      <HeaderTeacher />
      <main className={styles.main}>
        <div className={styles.titlePage}>
          <p className={styles.title}>MES RESSOURCES</p>
        </div>
        <div className={styles.section}>
          <div className={styles.leftSection}>
            <div className={styles.ressourcesSection}>
              <p className={styles.subtitle}>Mes ressources</p>
              <button
                className={styles.btn}
                onClick={() => setModalAddRessource(true)}
              >
                <span className={styles.addText}>+ Ajouter</span>
              </button>
              <div className={styles.ressourcesList}>{ressources}</div>
            </div>
          </div>
          <div className={styles.rightSection}>
            <div className={styles.sharingSection}>
              <p className={styles.subtitle}>Ressources à partager</p>
              <div className={styles.sharingList}>{ressourcesToShare}</div>
            </div>
            <div className={styles.studentsSection}>
              <div className={styles.studentsList}>
                <select
                  className={styles.selectList}
                  type="text"
                  value={students}
                  onChange={(e) => setStudents([e.target.value])}
                >
                  <option value="">Choisir un élève</option>
                  {studentsChoice}
                </select>
                <button
                  className={styles.shareBtn}
                  onClick={() => shareRessources()}
                >
                  <span className={styles.addText}>Partager</span>
                </button>
                <p className={styles.subtitle}>Partager à...</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <FooterTeacher />
      {modalAddRessource && (
        <ModalAddRessource
          onClose={() => setModalAddRessource(false)}
          addRessourceFct={handleAddRessource}
        />
      )}
      {loading && <Loading />}
    </div>
  );
}

export default RessourcesTeacher;
