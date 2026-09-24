import classes from "./ReferralPrescription.module.css";
import { ITaminIcid } from "@/Components/Admin/Tamin/Icid/AdminManageTaminIcidsPage";
import { ITaminSpec } from "@/Components/Admin/Tamin/Spec/AdminManageTaminSpecsPage";
import { ITaminComplaint } from "@/Components/Admin/Tamin/TaminComplaint/AdminManageTaminComplaintPage";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { clamp } from "@/Components/helpers/lib";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import useNotification from "@/Components/Hooks/useNotification";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import AreaInput from "@/Components/UI/AreaInput";
import Button from "@/Components/UI/Button";
import Counter from "@/Components/UI/Counter";
import DateInput from "@/Components/UI/DateInput";
import FancySelect from "@/Components/UI/FancySelect";
import NodesSelector from "@/Components/UI/NodesSelector";
import PopupCard from "@/Components/UI/PopupCard";
import { useCallback, useState } from "react";
import useSWR from "swr";
import usePrescription from "../Store/usePrescription";
import { IUserIdentity } from "@/Components/Dashboard/DashboardPage";

const LOCALE_NS: ContentNamespace[] = ["common", "doctorPanelPrescriptionCreate"];

type ReferralPrescriptionInput = Partial<{
  spec: string | null;
  complaints: string[] | null;
  icds: string[] | null;
  description: string;
  quantity: number;
  referralDate: Date;
}>;

const ReferralPrescriptionPopup = ({ patient }: { patient: IUserIdentity }) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const [input, setInput] = useState<ReferralPrescriptionInput>({});

  const [isLoading, setIsLoading] = useState<Record<string, unknown> | null>(
    null,
  );

  const pushNotification = useNotification();

  const onSubmit = useCallback(() => {
    if (!!isLoading) return;
    if (
      !input.spec ||
      !input.complaints?.length ||
      !input.icds?.length ||
      !input.quantity ||
      !input.referralDate ||
      !patient
    )
      return pushNotification(getContent("checkInput"), "Warn");
    setIsLoading({ ...input, patient: patient._id });
  }, [getContent, input, isLoading, patient, pushNotification]);

  return (
    <PopupCard>
      <div className={classes.main}>
        <NodesSelector
          readOnly={!!isLoading}
          path={`${API}/doctor/referral/base#specs`}
          dataParser={(res) => {
            return (res as { data: { specs: ITaminSpec[] } }).data.specs;
          }}
          getOptionLabel={(node) => (node as ITaminSpec).specDesc}
          getOptionValue={(node) => (node as ITaminSpec)._id}
          title={getContent("referreeSpeciality")}
          onChange={(e) => setInput((prev) => ({ ...prev, spec: e }))}
        />
        <NodesSelector
          readOnly={!!isLoading}
          path={`${API}/doctor/referral/base#complaints`}
          dataParser={(res) =>
            (res as { data: { complaints: ITaminComplaint[] } }).data.complaints
          }
          getOptionLabel={(node) => (node as ITaminComplaint).displayName}
          getOptionValue={(node) => (node as ITaminComplaint)._id}
          title={getContent("referralPrescriptionComplaints")}
          multi
          onChange={(e) => setInput((prev) => ({ ...prev, complaints: e }))}
        />
        <NodesSelector
          path={`${API}/doctor/referral/base#icds`}
          dataParser={(res) =>
            (res as { data: { icds: ITaminIcid[] } }).data.icds
          }
          getOptionLabel={(node) =>
            `${(node as ITaminIcid).icdName} | ${(node as ITaminIcid).icdCode}`
          }
          getOptionValue={(node) => (node as ITaminIcid)._id}
          multi
          onChange={(e) => setInput((prev) => ({ ...prev, icds: e }))}
          title={getContent("referralPrescriptionIcds")}
          readOnly={!!isLoading}
        />
        <AreaInput
          title={getContent("description")}
          onChange={(e) =>
            setInput((prev) => ({ ...prev, description: e.target.value }))
          }
          readOnly={!!isLoading}
        />
        <Counter
          title={getContent("quantity")}
          value={input.quantity || 0}
          onChange={(e) => setInput((prev) => ({ ...prev, quantity: e }))}
          onTick={(tick) =>
            setInput((prev) => ({
              ...prev,
              quantity: clamp(
                1,
                (prev.quantity || 0) + tick,
                Number.MAX_SAFE_INTEGER,
              ),
            }))
          }
        />
        <DateInput
          onChange={(e) => setInput((prev) => ({ ...prev, referralDate: e }))}
          readOnly={!!isLoading}
          title={getContent("referralDate")}
        />
        <div className={classes.actions}>
          <Button onClick={onSubmit} isLoading={!!isLoading}>
            {getContent("submitReferralPrescription")}
          </Button>
          <Button variant="Error">{getContent("cancel")}</Button>
        </div>
      </div>
      <Act
        path={isLoading ? `${API}/doctor/referral` : null}
        method="POST"
        payload={isLoading || undefined}
        onDone={(status) => {
          setIsLoading(null);
        }}
      />
    </PopupCard>
  );
};

const ReferralPrescription = () => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { setPopup } = usePopup();
  const { patient } = usePrescription();

  if (!patient) return null;
  return (
    <Button
      onClick={() =>
        setPopup(
          "ReferralPrescription",
          <ReferralPrescriptionPopup patient={patient} />,
        )
      }
    >
      {getContent("referralPrescription")}
    </Button>
  );
};

export default ReferralPrescription;
