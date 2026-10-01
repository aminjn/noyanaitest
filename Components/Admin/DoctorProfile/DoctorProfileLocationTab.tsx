import { useState } from "react";
import classes from "./DoctorProfileLocationTab.module.css";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import AreaInput from "@/Components/UI/AreaInput";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import PointPicker from "../UI/PointPicker";
import { ta } from "@/Components/Admin/i18n/adminText";

// The office point, through the shared PointPicker (search, map click, "my
// location" or typed coordinates), same as the centre record pages. The
// point's address fills an empty address, or replaces it on "use this
// address".
const DoctorProfileLocationTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const { input, setInput, isLoading, submit } = useForm<{
    point?: [number, number];
    address?: string;
  }>({
    path: `${API}/auto/doctorprofile/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => ({
      ...(inp.point ? { location: { type: "Point", coordinates: inp.point } } : {}),
      ...(inp.address?.trim() ? { address: inp.address.trim() } : {}),
    }),
  });
  // the address box is uncontrolled: bumped when the map fills it
  const [addressVersion, setAddressVersion] = useState<number>(0);
  const currentAddress = input.address ?? (typeof node.address === "string" ? node.address : "");
  const changed = !!input.point || input.address !== undefined;

  return (
    <div className={classes.main}>
      <p className={classes.hint}>
        {ta(
          "روی نقشه، محل مطب را انتخاب کنید؛ جستجوی «نزدیک من» و نقشه‌ی سایت از همین نقطه استفاده می‌کنند.",
        )}
      </p>
      <PointPicker
        defaultValue={node.location?.coordinates as [number, number] | undefined}
        onChange={(point) => setInput((prev) => ({ ...prev, point }))}
        currentAddress={currentAddress}
        onUseAddress={(address) => {
          setInput((prev) => ({ ...prev, address }));
          setAddressVersion((v) => v + 1);
        }}
      />
      <AreaInput
        key={addressVersion}
        title={ta("آدرس")}
        defaultValue={currentAddress}
        onChange={(e) => {
          const address = e.target.value;
          setInput((prev) => ({ ...prev, address }));
        }}
      />
      <FormActions>
        <Button
          isLoading={isLoading}
          variant={changed ? "Primary" : "Disable"}
          onClick={changed ? submit : undefined}
        >
          {ta("ذخیره موقعیت")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DoctorProfileLocationTab;
