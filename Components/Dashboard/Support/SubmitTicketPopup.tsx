import PopupCard from "@/Components/UI/PopupCard";
import classes from "./SubmitTicketPopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import {
  ITicket,
  ticketSubjectContentKeyDict,
  ticketSubjects,
} from "./SupportPage";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";

const NS: ContentNamespace[] = ["common", "dashboardSupport"];

const SubmitTicketPopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <PopupCard>
      <CreateForm<ITicket & { content: string }, { data: ITicket }>
        renderer={{
          subject: {
            title: getContent("ticketSubject"),
            type: "select",
            options: ticketSubjects.reduce(
              (acc, el) => ({
                ...acc,
                [el]: getContent(ticketSubjectContentKeyDict[el]),
              }),
              {},
            ),
          },
          title: {
            type: "text",
            title: getContent("ticketTitle"),
            required: true,
          },
          content: { type: "area", title: getContent("ticketMessage") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/support`,
          method: "POST",
          successCb: (data) => {
            mutate();
            closePopup();
            push(`/dashboard/support/${data.data._id}`);
          },
          hasProblem: (inp) => {
            if (!inp.title) return getContent("titleMissingError");
            if (!inp.content) return getContent("messageMissingError");
            if (!inp.subject) return getContent("subjectMissingError");
            return false;
          },
        }}
      />
    </PopupCard>
  );
};

export default SubmitTicketPopup;
