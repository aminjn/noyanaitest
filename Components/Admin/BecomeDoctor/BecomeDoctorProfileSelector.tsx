import { IUser } from "@/Components/Hooks/useUser";
import classes from "./BecomeDoctorProfileSelector.module.css";
import useSWR from "swr";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { useMemo } from "react";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import AssignDoctorProfileToUserPopup from "./AssignProfileToUserPopup";
import InstantCreateDoctorProfilePopup from "./InstantCreateDoctorProfilePopup";
import CloneDoctorProfileFromExistingDoctorPopup from "./CloneDoctorProfileFromExistingDoctorPopup";
import FormActions from "../UI/FormActions";
import List from "../UI/List";

const BecomeDoctorProfileSelector = ({ user }: { user: IUser }) => {
  const { data, error, mutate } = useSWR<IDoctorProfile[]>(
    `${API}/auto/doctorprofile?user=${user._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const profile = useMemo<IDoctorProfile | null>(
    () => (data ? data[0] || null : null),
    [data]
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!profile ? (
        <></>
      ) : (
        <List>
          <p>هنوز پروفایلی برای این کاربر ثبت نشده</p>
          <FormActions>
            <Button
              onClick={() =>
                setPopup(
                  "AssignDoctorProfileToUserPopup",
                  <AssignDoctorProfileToUserPopup mutate={mutate} user={user} />
                )
              }
            >
              ثبت پروفایل موجود برای این کاربر
            </Button>
            <Button
              onClick={() =>
                setPopup(
                  "InstantCreateDoctorProfile",
                  <InstantCreateDoctorProfilePopup
                    user={user}
                    mutate={mutate}
                  />
                )
              }
            >
              ساخت پروفایل جدید و ثبت برای این کاربر
            </Button>
            <Button
              onClick={() =>
                setPopup(
                  "CloneDoctorProfileFromExistingDoctor",
                  <CloneDoctorProfileFromExistingDoctorPopup
                    user={user}
                    mutate={mutate}
                  />
                )
              }
            >
              ساخت پروفایل از پزشکان موجود در سایت
            </Button>
          </FormActions>
        </List>
      )}
    </HandleLoading>
  );
};

export default BecomeDoctorProfileSelector;
