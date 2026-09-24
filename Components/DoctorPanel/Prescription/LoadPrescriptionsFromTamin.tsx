import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import LoadedPrescriptionPopup, {
  LoadedPrescription,
} from "./LoadedPrescriptionPopup";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionList"];

const LoadPrescriptionsFromTamin = () => {
  const getContent = useScopedLocale(LOCALE_NS);

  const { closePopup, setPopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<{ tracking: string }, { data: LoadedPrescription }>
        renderer={{
          tracking: { type: "text", title: getContent("taminPrescriptionId") },
        }}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/doctor/presc/reload`,
          method: "POST",
          successCb: (res) => {
            if (!!res)
              setPopup(
                "LoadedPriscription",
                <LoadedPrescriptionPopup data={res.data} />,
              );
          },
        }}
      />
    </PopupCard>
  );
};

export default LoadPrescriptionsFromTamin;
