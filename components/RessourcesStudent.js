import Head from "next/head";
import HeaderStudent from "./HeaderStudent";
import FooterStudent from "./FooterStudent";
import RessourceCard from "./RessourceCard";
import ModalAddRessource from "./ModalAddRessource";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

import styles from "../styles/RessourcesStudent.module.css";

function RessourcesStudent() {
  const router = useRouter();
  const [ressourcesData, setRessourcesData] = useState([]);
  const studentsData = useSelector((state) => state.students.value);

  useEffect(() => {
    (async () => {
      checkIsSignin(router); //Check if user is still authenticated, if not send them back to signin
      // Fetch ressources
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ressources/getRessourcesStudent`,
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
      } catch (error) {
        console.error("Error fetching data:", error);
        alert(error);
      }
    })();
  }, []);

  const ressources = ressourcesData?.map((data, i) => (
    <RessourceCard
      key={i}
      _id={data._id}
      title={data.title}
      tags={data.tags[0]}
      url={data.url}
      share={false}
      show={false}
    />
  ));

  return (
    <div className={styles.content}>
      <Head>
        <title>MyTeacher - Ressources </title>
      </Head>
      <HeaderStudent />
      <main className={styles.main}>
        <div className={styles.titlePage}>
          <p className={styles.title}>MES RESSOURCES</p>
        </div>
        <div className={styles.section}>
          <div className={styles.ressourcesSection}>
            <div className={styles.ressourcesList}>
              <p className={styles.subtitle}>Mes ressources</p>
              {ressources}
            </div>
          </div>
        </div>
      </main>
      <FooterStudent />
    </div>
  );
}
export default RessourcesStudent;
