import Button from "@/Components/UI/Button";
import useLocale from "@/Components/Hooks/useLocale";
import ChatBubbleIcon from "@/Components/Icons/ChatBubbleIcon";
import VideoIcon from "@/Components/Icons/VideoIcon";
import CallCallingIcon from "@/Components/Icons/CallCallingIcon";
import { DoctorSessionType } from "@/Components/DoctorPanel/Calendar/DoctorCalendarDay";

// Reservation.chat / Reservation.callRoom are set by the backend cron sweep
// once it dispatches the session channel for textChat / voiceCall /
// videoCall reservations (see project memory:
// project-reservation-lifecycle-2026-08). sipCall/inPerson never populate
// either field, so this renders nothing for them.
const ReservationJoinButton = ({
  chat,
  callRoom,
  sessionType,
}: {
  chat?: string;
  callRoom?: string;
  sessionType: DoctorSessionType;
}) => {
  const getContent = useLocale();

  if (chat)
    return (
      <Button href={`/dashboard/chat/${chat}`} leadIcon={<ChatBubbleIcon />}>
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
