import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Calendar, momentLocalizer } from "react-big-calendar";
import ModalAddEvent from "./ModalAddEvent";
import ModalRemoveEvent from "./ModalRemoveEvent";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/BigCalendar.module.css";

const now = new Date();

const localizer = momentLocalizer(moment);

export default function BigCalendar() {
  const [modalAdd, setModalAdd] = useState(false);
  const [modalRemove, setModalRemove] = useState(false);
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [eventSelected, setEventSelected] = useState(null);

  const eventsData = useSelector((state) => state.planning.value);
  console.log("events stored", eventsData);

  const handleSelectSlot = ({ start, end }) => {
    setStart(start);
    setEnd(end);
    setModalAdd(true);
  };

  const handleSelectEvent = (event) => {
    setEventSelected(event);
    setModalRemove(true);
  };

  const eventsCalendar = eventsData.map((e) => {
    // si e.student vaut undefined sur un event, ça crash.
    // const description = `${e.student[0] ? e.student[0] : ""} - ${e.structure ? e.structure : ""} - ${e.location ? e.location : ""} - ${e.desc ? e.desc : ""}`;
    const description = `${e.student !== null ? e.student.firstName : ""} - ${e.structure ?? ""} - ${e.location ?? ""} - ${e.desc ?? ""}`;
    return {
      id: e.id,
      title: e.title,
      start: new Date(e.startAt),
      end: new Date(e.endAt),
      desc: description,
    };
  });

  return (
    <div className={styles.planningCalendar}>
      <Calendar
        localizer={localizer}
        views={["day", "week", "month"]}
        selectable
        defaultDate={new Date()}
        defaultView="week"
        events={eventsCalendar}
        startAccessor="start"
        endAccessor="end"
        culture="fr"
        messages={{
          allDay: "Tous les jours",
          previous: "Précédent",
          next: "Suivant",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
          agenda: "Agenda",
          date: "Date",
          time: "Heure",
          event: "Evenement",
        }}
        style={{ height: "100%", width: "100%" }}
        tooltipAccessor={(event) => event.desc}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        scrollToTime={new Date(1970, 1, 1, 7, 0, 0)}
        min={new Date(1970, 1, 1, 7, 0, 0)}
        max={new Date(1970, 1, 1, 21, 0, 0)}
      />
      {modalAdd && (
        <ModalAddEvent
          onClose={() => setModalAdd(false)}
          start={start}
          end={end}
        />
      )}
      {modalRemove && (
        <ModalRemoveEvent
          onClose={() => setModalRemove(false)}
          event={eventSelected}
        />
      )}
    </div>
  );
}
