import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { MergedAutoFaq } from "@/Components/Seo/autoFaq";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

type Input = { question: string; answer: string };

// Rewording one automatic FAQ item (DoctorAutoFaqSection): a text left as
// the automatic one (or emptied) is not stored, so it keeps following the
// doctor's data.
const EditAutoFaqPopup = ({ item, mutate }: { item: MergedAutoFaq; mutate: () => unknown }) => {
  const { closePopup } = usePopup();
  const getContent = useScopedLocale(NS);
  const own = (value: unknown, auto: string) => {
    const v = typeof value === "string" ? value.trim() : "";
    return v && v !== auto ? v : null;
  };
  return (
    <PopupCard>
      <CreateForm<Input>
        style={{ width: "min(40rem , 90dvw)" }}
        defaultValue={{ question: item.question, answer: item.answer }}
        renderer={{
          question: { title: getContent("question"), type: "text" },
          answer: { title: getContent("answer"), type: "area" },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/doctor/faq/auto/${item.key}`,
          method: "PUT",
          parser: "JSON",
          mutator: (inp) => ({
            customQuestion: own(inp.question, item.autoQuestion),
            customAnswer: own(inp.answer, item.autoAnswer),
          }),
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

export default EditAutoFaqPopup;
