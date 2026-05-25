import useUser, { IUser } from "@/Components/Hooks/useUser";
import classes from "./BecomeDoctorProfileSelector.module.css";
import useSWR from "swr";
import {
  IBecomeDoctorRequest,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { Fragment, useMemo } from "react";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import AssignDoctorProfileToUserPopup from "./AssignProfileToUserPopup";
import InstantCreateDoctorProfilePopup from "./InstantCreateDoctorProfilePopup";
import CloneDoctorProfileFromExistingDoctorPopup from "./CloneDoctorProfileFromExistingDoctorPopup";
import FormActions from "../UI/FormActions";
import List from "../UI/List";
import Link from "next/link";
import RemoveUserFromDoctorProfilePopup from "./RemoveUserFromDoctorProfilePopup";
import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";

const BecomeDoctorProfileSelector = ({
  req,
}: {
  req: IBecomeDoctorRequest<{ UserPopulated: true }>;
}) => {
  const { data, error, mutate } = useSWR<
    IDoctorProfile<{ UserPopulated: Record<never, never> }>[]
  >(`${API}/auto/doctorprofile?user=${req.user._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { user } = useUser();

  const profile = useMemo<IDoctorProfile | null>(
    () => (data ? data[0] || null : null),
    [data],
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!profile ? (
        <List>
          <p>
            <span>پروفایل اختصاص داده شده به این کاربر : </span>
            <InlineLink href={adminPath(`/doctorprofile/${profile._id}`)}>
              {`${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
                profile._id}
            </InlineLink>
          </p>
          <FormActions>
            {user?.role === "admin" && (
              <Button
                variant="Error"
                onClick={() =>
                  setPopup(
                    "RemoveUserFromDoctorProfile",
                    <RemoveUserFromDoctorProfilePopup
                      profile={profile}
                      mutate={mutate}
                    />,
                  )
                }
              >
                حذف پروفایل اختصاص داده شده به این کاربر
              </Button>
            )}
          </FormActions>
        </List>
      ) : (
        <List>
          <p>هنوز پروفایلی برای این کاربر ثبت نشده</p>
          <FormActions>
            {hasAccess("DoctorProfile", "update") && (
              <Button
                onClick={() =>
                  setPopup(
                    "AssignDoctorProfileToUserPopup",
                    <AssignDoctorProfileToUserPopup
                      mutate={mutate}
                      user={req.user}
                    />,
                  )
                }
              >
                ثبت پروفایل موجود برای این کاربر
              </Button>
            )}
            {hasAccess("DoctorProfile", "write") && (
              <Fragment>
                <Button
                  onClick={() =>
                    setPopup(
                      "InstantCreateDoctorProfile",
                      <InstantCreateDoctorProfilePopup
                        req={req}
                        mutate={mutate}
                      />,
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
                        user={req.user}
                        mutate={mutate}
                      />,
                    )
                  }
                >
                  ساخت پروفایل از پزشکان موجود در سایت
                </Button>
              </Fragment>
            )}
          </FormActions>
        </List>
      )}
    </HandleLoading>
  );
};

export default BecomeDoctorProfileSelector;
