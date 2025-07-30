import { IUser } from "@/Components/Hooks/useUser";
import classes from "./InstantCreateDoctorProfilePopup.module.css";
import Box from "../UI/Box";
import FormActions from "../UI/FormActions";
import ToggleInput from "@/Components/UI/ToggleInput";
import { useState } from "react";
import Button from "@/Components/UI/Button";
import {
  IBecomeDoctorRequest,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import usePopup from "@/Components/Hooks/usePopup";
import Act from "@/Components/UI/Act";
import { API } from "@/Components/config";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";

const InstantCreateDoctorProfilePopup = ({
  mutate,
  req,
}: {
  mutate: () => unknown;
  req: IBecomeDoctorRequest<{ UserPopulated: true }>;
}) => {
  const [proceedToProfile, setProceedToProfile] = useState<boolean>(false);
  const [payload, setPayload] = useState<Partial<IDoctorProfile> | null>(null);

  const { closePopup } = usePopup();

  const push = useProgress();

  return (
    <Box>
      <ToggleInput
        value={proceedToProfile}
        onChange={() => setProceedToProfile((prev) => !prev)}
        title="رفتن به صفحه پروفایل ساخته شده بعد از اتمام عملیات"
      />
      <FormActions>
        <Button
          onClick={() => setPayload({ user: req.user._id })}
          isLoading={!!payload}
        >
          ساخت پروفایل خام
        </Button>
        <Button
          isLoading={!!payload}
          onClick={() =>
            setPayload({
              user: req.user._id,
              firstName: req.firstName,
              lastName: req.lastName,
              ssid: req.ssid,
              gender: req.gender,
              medicalSystemTitle: req.medicalSystemTitle,
              medicalSystemCode: req.medicalSystemCode,
              province: req.province,
              city: req.city,
              address: req.address,
            })
          }
        >
          اعمال موارد داخل این درخواست در پروفایلی که ساخته میشود
        </Button>
        <Button onClick={() => closePopup()} variant="Neutral">
          انصراف
        </Button>
      </FormActions>
      <Act<{ data: { data: IDoctorProfile } }>
        path={!!payload ? `${API}/auto/doctorprofile` : null}
        method="POST"
        payload={payload || undefined}
        onDone={(status, data) => {
          setPayload(null);
          if (!status || !data) return;
          mutate();
          if (proceedToProfile)
            push(adminPath(`/doctorprofile/${data.data.data._id}`));
          closePopup();
        }}
      />
    </Box>
  );
};

export default InstantCreateDoctorProfilePopup;
