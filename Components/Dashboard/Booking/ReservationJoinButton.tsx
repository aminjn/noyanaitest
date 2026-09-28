import Button from "@/Components/UI/Button";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import VideoIcon from "@/Components/Icons/VideoIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import { DoctorSessionType } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";

const NS: ContentNamespace[] = ["common", "dashboardReservationJoinButton"];

// Reservation.chat / Reservation.callRoom are set by the backend cron sweep
// once it dispatches the session channel for textChat / voiceCall /
// videoCall reservations (see project memory:
// project-reservation-lifecycle-2026-08). sipCall/inPerson never populate
// either field, so this renders nothing for them.
const ReservationJoinButton = ({
  chat,
  callRoom,
  sessionType,
  panel = "patient",
}: {
  chat?: string;
  callRoom?: string;
  sessionType: DoctorSessionType;
  // which panel's chat page to open (the call page is shared)
  panel?: "patient" | "doctor";
}) => {
  const getContent = useScopedLocale(NS);

  if (chat)
    return (
      <Button
        href={
          panel === "doctor"
            ? `/doctorpanel/chat/${chat}`
            : `/dashboard/chat/${chat}`
        }
        leadIcon={<ChatBubbleIcon />}
      >
        {getContent("joinSession")}
      </Button>
    );

  if (callRoom)
    return (
      <Button
        href={`/dashboard/call/${callRoom}`}
        leadIcon={
          sessionType === "videoCall" ? <VideoIcon /> : <CallCallingIcon />
        }
      >
        {getContent("joinSession")}
      </Button>
    );

  return null;
};

export default ReservationJoinButton;
