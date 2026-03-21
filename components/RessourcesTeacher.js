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
        data.result ? setRessourcesData(data.ressources) : alert(data.error);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        alert("Server error to get ressources.");
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
      data.result
        ? setRessourcesData((ress) =>
            ress.filter((r) => r._id !== comingProps._id),
          )
        : alert(data.error);
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Error while deleting ressources.");
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
        data.result
          ? (setSharingRessources([]),
            setStudents([]),
            alert("Ressources partagées !"))
          : console.log(data.error);
      } catch (error) {
        console.error("Error adding event:", error);
        alert("Server error to share ressources.");
      }
    }
  };

  const handleAddRessource = async (newRessource) => {
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
            body: formData,
          },
        );

        const data = await response.json();

        if (data.result) {
          alert("Ressource ajoutée !");
          setAddFlag(!addFlag);
        } else {
          alert(`Erreur : ${data.error}`);
        }
      } catch (error) {
        console.error("Error adding ressource :", error);
        alert("Server error while adding ressources.");
      }
    } else {
      alert("Informations manquantes.");
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
