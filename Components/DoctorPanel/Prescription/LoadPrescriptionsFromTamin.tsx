import CreateForm from "@/Components/Admin/UI/CreateForm";
import { API } from "@/Components/config";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import LoadedPrescriptionPopup, {
  LoadedPrescription,
} from "./LoadedPrescriptionPopup";

const LoadPrescriptionsFromTamin = () => {
  const getContent = useLocale();

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
