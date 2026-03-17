import styles from "../styles/ModalAddRessource.module.css";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faFileCircleCheck } from "@fortawesome/free-solid-svg-icons";

export default function ModalAddRessource({ onClose, addRessourceFct }) {
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [file, setFile] = useState(null);
  console.log("file", file);

  const handleAdd = () => {
    if (!title && !tag && !file) {
      console.log("Data missing in form");
    } else {
      addRessourceFct({ title, tag, file });
      onClose();
    }
  };

  const handleUploadRessource = () => {
    // Logique manquante pour uploader la ressource puis l'envoyer sur cloudinary via backend et récupérer url
    setUrl(
      "https://res.cloudinary.com/dzj8q3n9o/image/upload/v1700000000/ressource_example.jpg",
    );
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <div className={styles.top}>
          <h2 className={styles.title}>Ajouter une ressource</h2>
          <FontAwesomeIcon
            className={styles.close}
            icon={faXmark}
            onClick={onClose}
          />
        </div>
        <div className={styles.content}>
          <input
            className={styles.input}
            type="text"
            placeholder="Titre de la ressource"
            maxLength="35"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            className={styles.input}
            type="text"
            placeholder="Tag de la ressource"
            maxLength="20"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <label className={styles.label} for="uploadFile">
            Choisir un fichier pdf
          </label>
          <input
            id="uploadFile"
            style={{ display: "none" }}
            className={styles.input}
            type="file"
            accept=".pdf"
            // value={file}
            onChange={(e) => setFile(e.target.files[0])}
          />
          {file && (
            <>
              <div className={styles.infoFile}>{file.name}</div>
              <FontAwesomeIcon
                className={styles.icon}
                icon={faFileCircleCheck}
                onClick={() => setFile("")}
              />
            </>
          )}

          <button className={styles.btn} onClick={() => handleAdd()}>
            Ajouter
          </button>
        </div>
      </div>
    </div>
  );
}
