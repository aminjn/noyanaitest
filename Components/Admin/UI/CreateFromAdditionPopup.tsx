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
import { ta } from "@/Components/Admin/i18n/adminText";
import MultiSelectInputServer from "@/Components/UI/MultiSelectInputServer";

export type AdditionKind = "clinic" | "hospital" | "insurance" | "pharmacy";

const labels: Record<AdditionKind, string> = {
  get clinic() {
  return ta("کلینیک");
},
  get hospital() {
  return ta("بیمارستان");
},
  get insurance() {
  return ta("بیمه");
},
  get pharmacy() {
  return ta("داروخانه");
},
};

// One "create the centre from this addition request" popup for all four
// kinds (2026-09). The backend does the work: it creates the centre
// (inactive, for review) with name, address and location, adds the
// requesting doctor as a member and marks the request Done. A centre that
// is already on NoyanAI is picked instead (2026-10), so a second copy is
// never made; the owner's mobile stays on the request.
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
  const [existing, setExisting] = useState<{ _id: string; name?: string } | null>(null);
  const { closePopup } = usePopup();
  const push = useProgress();
  const label = labels[kind];
  return (
    <PopupCard title={ta("مرکز از روی درخواست جدید")}>
      <p>
        {ta("${1} با نام، نشانی و موقعیت این درخواست ساخته می‌شود (غیرفعال، تا پس از تکمیل پروفایل فعالش کنید)، پزشک درخواست‌دهنده عضو آن می‌شود و درخواست «انجام شده» می‌شود. اگر این مرکز از قبل در سایت هست، آن را انتخاب کنید تا مرکز تکراری ساخته نشود.", [label])}
      </p>
      <MultiSelectInputServer<{ _id: string; name?: string }>
        multi={false}
        value={existing ? [existing] : []}
        placeholder={ta("اتصال به ${1} موجود (اختیاری)", [label])}
        path={`${API}/auto/${kind}`}
        getOption={(n) => ({ title: n.name || n._id, value: n._id })}
        onChange={(e) => setExisting(e[0] || null)}
      />
      <ToggleInput
        value={proceed}
        readOnly={isLoading}
        onChange={() => setProceed((prev) => !prev)}
        title={ta("رفتن به صفحه‌ی ${1} ساخته‌شده", [label])}
      />
      <FormActions>
        <Button isLoading={isLoading} onClick={() => setIsLoading(true)}>
          {existing ? ta("اتصال به همین ${1}", [label]) : ta("ساخت ${1}", [label])}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
        </Button>
      </FormActions>
      <Act<{ data: { node: { _id: string } } }>
        path={
          isLoading ? `${API}/admin/addition/${kind}/${requestId}/create` : null
        }
        method="POST"
        payload={existing ? { orgId: existing._id } : undefined}
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
