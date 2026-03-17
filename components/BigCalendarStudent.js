import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import "react-big-calendar/lib/css/react-big-calendar.css";
import styles from "../styles/BigCalendar.module.css";

moment.locale("fr");

const localizer = momentLocalizer(moment);

function BigCalendarStudent() {
  const eventsData = useSelector((state) => state.planning.value);

  const eventsCalendar = useMemo(() => {
    return eventsData
      .filter((event) => event.start && event.end)
      .map((event) => {
        const description = `${event.structure ? event.structure : ""} - ${
          event.location ? event.location : ""
        } - ${event.desc ? event.desc : ""}`;

        return {
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: new Date(event.end),
          desc: description,
        };
      });
  }, [eventsData]);

  return (
    <div className={styles.planningCalendar}>
      <Calendar
        localizer={localizer}
        defaultView="week"
        views={["week"]}
        min={new Date(0, 0, 0, 7, 0, 0)}
        max={new Date(0, 0, 0, 21, 0, 0)}
        scrollToTime={new Date(1970, 1, 1, 7, 0, 0)}
        defaultDate={new Date()}
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
          event: "Événement",
        }}
        style={{ height: "100%", width: "100%" }}
        tooltipAccessor={(event) => event.desc}
      />
    </div>
  );
}

export default BigCalendarStudent;
