import classes from "./DoctorProfileLocationTab.module.css";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import useForm from "@/Components/Hooks/useForm";
import { API } from "@/Components/config";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import PointPicker from "../UI/PointPicker";
import { ta } from "@/Components/Admin/i18n/adminText";

// The office point, through the shared PointPicker (map click or typed
// coordinates), same as the centre record pages.
const DoctorProfileLocationTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const { input, setInput, isLoading, submit } = useForm<{
    point?: [number, number];
  }>({
    path: `${API}/auto/doctorprofile/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) =>
      inp.point ? { location: { type: "Point", coordinates: inp.point } } : {},
  });

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
      />
      <FormActions>
        <Button
          isLoading={isLoading}
          variant={input.point ? "Primary" : "Disable"}
          onClick={input.point ? submit : undefined}
        >
          {ta("ذخیره موقعیت")}
        </Button>
      </FormActions>
    </div>
  );
};

export default DoctorProfileLocationTab;
