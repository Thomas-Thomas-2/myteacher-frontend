import { useEffect, useState } from "react";
import HeaderTeacher from "./HeaderTeacher";
import FooterTeacher from "./FooterTeacher";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/TeacherProfile.module.css";
const { checkIsSignin } = require("../modules/checkRole");
import { useRouter } from "next/router";

function TeacherProfile() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    avatarUrl: "",
    discipline: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    checkIsSignin(router); //Check if user is still authenticated, if not send them back to signin
    const fetchProfile = async () => {
      try {
        const [userRes, teacherRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`, {
            method: "GET",
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/teachers/me`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const userData = await userRes.json();
        const teacherData = await teacherRes.json();

        if (userData.result && teacherData.result) {
          setFormData({
            firstName: userData.user.firstName || "",
            lastName: userData.user.lastName || "",
            email: userData.user.email || "",
            phone: teacherData.teacher.phone || "",
            address: teacherData.teacher.address || "",
            avatarUrl: teacherData.teacher.avatarUrl || "",
            discipline: (teacherData.teacher.discipline || []).join(", "),
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        alert(error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarEdit = () => {
    const newAvatar = window.prompt(
      "Entrez l’URL de votre avatar :",
      formData.avatarUrl,
    );

    if (newAvatar !== null) {
      setFormData((prev) => ({
        ...prev,
        avatarUrl: newAvatar,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/teachers/me`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            avatarUrl: formData.avatarUrl,
            discipline: formData.discipline
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          }),
        },
      );

      const data = await response.json();

      if (data.result) {
        setMessage("Profil mis à jour avec succès");
      } else {
        setMessage(data.error || "Erreur lors de la mise à jour");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      setMessage("Erreur serveur");
    }
  };

  return (
    <>
      <div className={styles.page}>
        <HeaderTeacher />

        <main className={styles.container}>
          <h1 className={styles.title}>Mon profil</h1>

          <form className={styles.card} onSubmit={handleSubmit}>
            <div className={styles.leftColumn}>
              <div className={styles.avatarWrapper}>
                <img
                  src={
                    formData.avatarUrl ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Avatar"
                  className={styles.avatarPreview}
                />
                <button
                  type="button"
                  className={styles.avatarEditButton}
                  onClick={handleAvatarEdit}
                  title="Modifier l’avatar"
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              </div>

              <div className={styles.identityBlock}>
                <div className={styles.row}>
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.row}>
                  <label>Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div className={styles.row}>
                  <label>Email</label>
                  <input type="text" value={formData.email} disabled />
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.row}>
                <label>Téléphone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <label>Adresse</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.row}>
                <label>Disciplines</label>
                <input
                  type="text"
                  name="discipline"
                  value={formData.discipline}
                  onChange={handleChange}
                  placeholder="Maths, Piano, Guitare..."
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.saveButton}>
                  Enregistrer
                </button>
              </div>

              {message && <p className={styles.message}>{message}</p>}
            </div>
          </form>
        </main>

        <FooterTeacher />
      </div>
    </>
  );
}

export default TeacherProfile;
