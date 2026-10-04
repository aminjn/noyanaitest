import useSWR from "swr";
import {
  IBecomeDoctorRequest,
  IDoctorProfile,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import { useMemo } from "react";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import AssignDoctorProfileToUserPopup from "./AssignProfileToUserPopup";
import FormActions from "../UI/FormActions";
import List from "../UI/List";
import RemoveUserFromDoctorProfilePopup from "./RemoveUserFromDoctorProfilePopup";
import { adminPath } from "@/Components/helpers/adminPath";
import InlineLink from "../UI/InlineLink";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";

// The applicant's doctor profile. Building a new one is the approve button
// in the decision banner (it copies the request); the "create" button here
// ran the same approval a second way and was dropped. Linking an existing,
// unclaimed profile is the one alternative, offered while the request is
// pending, and it approves the request too.
const BecomeDoctorProfileSelector = ({
  req,
  mutateRequest,
}: {
  req: IBecomeDoctorRequest<{ UserPopulated: true }>;
  // linking approves the request: its page refreshes too
  mutateRequest?: () => unknown;
}) => {
  const { data, error, mutate } = useSWR<
    IDoctorProfile<{ UserPopulated: Record<never, never> }>[]
  >(`${API}/auto/doctorprofile?user=${req.user._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const profile = useMemo<IDoctorProfile | null>(
    () => (Array.isArray(data) ? data[0] || null : null),
    [data],
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!profile ? (
        <List>
          <p>
            <span>{ta("پروفایل اختصاص داده شده به این کاربر :")} </span>
            <InlineLink href={adminPath(`/doctorprofile/${profile._id}`)}>
              {`${profile.firstName || ""} ${profile.lastName || ""}`.trim() ||
                profile._id}
            </InlineLink>
          </p>
          <FormActions>
            {hasAccess("DoctorProfile", "update") && (
              <Button
                variant="Error"
                mode="Outline"
                size="M"
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
                {ta("جدا کردن مالک پنل")}
              </Button>
            )}
          </FormActions>
        </List>
      ) : (
        <List>
          <p>{ta("هنوز پروفایلی برای این کاربر ثبت نشده")}</p>
          {req.status === "Pending" && hasAccess("DoctorProfile", "update") && (
            <FormActions>
              <Button
                onClick={() =>
                  setPopup(
                    "AssignDoctorProfileToUserPopup",
                    <AssignDoctorProfileToUserPopup
                      mutate={() => {
                        mutate();
                        mutateRequest?.();
                      }}
                      req={req}
                    />,
                  )
                }
              >
                {ta("ثبت پروفایل موجود برای این کاربر")}
              </Button>
            </FormActions>
          )}
        </List>
      )}
    </HandleLoading>
  );
};

export default BecomeDoctorProfileSelector;
