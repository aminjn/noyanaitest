import { useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import ToggleInput from "@/Components/UI/ToggleInput";
import Button from "@/Components/UI/Button";
import Act from "@/Components/UI/Act";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { API } from "@/Components/config";
import { adminPath } from "@/Components/helpers/adminPath";
import FormActions from "./FormActions";

export type AdditionKind = "clinic" | "hospital" | "insurance" | "pharmacy";

const labels: Record<AdditionKind, string> = {
  clinic: "کلینیک",
  hospital: "بیمارستان",
  insurance: "بیمه",
  pharmacy: "داروخانه",
};

// One "create the centre from this addition request" popup for all four
// kinds (2026-09). The backend does the work: it creates the centre
// (inactive, for review) with name, address, phone and location, adds the
// requesting doctor as a member and marks the request Done.
const CreateFromAdditionPopup = ({
  kind,
  requestId,
  mutate,
}: {
  kind: AdditionKind;
  requestId: string;
  mutate?: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [proceed, setProceed] = useState(false);
  const { closePopup } = usePopup();
  const push = useProgress();
  const label = labels[kind];
  return (
    <PopupCard>
      <p>
        {`${label} با نام، نشانی، تلفن و موقعیت این درخواست ساخته می‌شود (غیرفعال، تا پس از تکمیل پروفایل فعالش کنید)، پزشک درخواست‌دهنده عضو آن می‌شود و درخواست «انجام شده» می‌شود.`}
      </p>
      <ToggleInput
        value={proceed}
        readOnly={isLoading}
        onChange={() => setProceed((prev) => !prev)}
        title={`رفتن به صفحه‌ی ${label} ساخته‌شده`}
      />
      <FormActions>
        <Button isLoading={isLoading} onClick={() => setIsLoading(true)}>
          {`ساخت ${label}`}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          انصراف
        </Button>
      </FormActions>
      <Act<{ data: { node: { _id: string } } }>
        path={
          isLoading ? `${API}/admin/addition/${kind}/${requestId}/create` : null
        }
        method="POST"
        onDone={(status, result) => {
          setIsLoading(false);
          if (!status) return;
          mutate?.();
          closePopup();
          const id = result?.data?.node?._id;
          if (id && proceed) push(adminPath(`/${kind}/${id}`));
        }}
      />
    </PopupCard>
  );
};

export default CreateFromAdditionPopup;
