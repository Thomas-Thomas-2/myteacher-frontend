import FicheStudentTeacher from "../components/FicheStudentTeacher";
import { useRouter } from "next/router";

function FicheStudentTeacherPage() {
  const router = useRouter();
  const { id } = router.query; // /fiche_student_teacher?id=123
  
  return <FicheStudentTeacher studentId={id}/>;
}

export default FicheStudentTeacherPage;
