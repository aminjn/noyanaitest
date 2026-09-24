import useSWR from "swr";
import useDoctor from "../Hooks/useDoctor";
import { IMcCode } from "./BecomeADoctorPage";
import { API } from "../config";
import { fetcher } from "../helpers/fetcher";
import classes from "./ConfirmMedicalCodePopup.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import FormActions from "../Admin/UI/FormActions";
import Button from "../UI/Button";
import usePopup from "../Hooks/usePopup";
import HandleLoading from "../Admin/UI/HandleLoading";
import { useState } from "react";
import Act from "../UI/Act";
import PopupCard from "../UI/PopupCard";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelBecomeDoctor"];

const ConfirmMedicalCodePopup = ({ node }: { node: IMcCode }) => {
  const { mutate } = useDoctor();
  const { data, error } = useSWR<IMcCode>(
    `${API}/doctor/request/${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(NS);

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <HandleLoading data={!!data} error={error}>
        <div className={classes.main}>
          <p>{getContent("createDoctroProfielWithThisMcCodeMessage")}</p>
          <FormActions>
            <Button onClick={() => setIsLoading(true)} isLoading={isLoading}>
              {getContent("confirm")}
            </Button>
            <Button onClick={() => closePopup()} variant="Neutral">
              {getContent("cancel")}
            </Button>
          </FormActions>
        </div>
        <Act
          path={isLoading ? `${API}/doctor/request/${node._id}` : null}
          method="PUT"
          onDone={(status) => {
            setIsLoading(false);
            if (!status) return;
            mutate();
            closePopup();
          }}
        />
      </HandleLoading>
    </PopupCard>
  );
};

export default ConfirmMedicalCodePopup;
