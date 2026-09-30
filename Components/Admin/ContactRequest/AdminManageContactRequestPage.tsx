"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import FormatDate from "@/Components/UI/FormatDate";
import CreateForm from "../UI/CreateForm";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import RequestInfoGrid from "../BecomeRequest/RequestInfoGrid";
import { displayPhone } from "../User/userShared";
import {
  contactRequestStatusDict,
  contactRequestSubjectDict,
  IContactRequest,
} from "./AdminManageContactRequestsPage";
import { ta } from "@/Components/Admin/i18n/adminText";
import classes from "./AdminManageContactRequestPage.module.css";

// A visitor's contact-form message (2026-09): what they wrote is shown as
// read-only facts; the admin only marks it handled (or deletes it).
const AdminManageContactRequestPage = () => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId;
  const { data, error, mutate } = useSWR<IContactRequest | null>(
    nodeId ? `${API}/auto/contactRequest/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            {
              title: ta("حذف"),
              danger: true,
              action: () =>
                setPopup(
                  "DeleteContactRequest",
                  <DeleteShitPopup
                    modelName="contactRequest"
                    nodeId={data._id}
                    mutate={() => push(adminPath("/contactRequest"))}
                  />,
                ),
            },
          ]}
        >
          <div className={classes.main}>
            <RequestInfoGrid
              items={[
                { label: ta("نام"), value: data.name },
                {
                  label: ta("شماره"),
                  value: data.phone ? (
                    <a href={`tel:${displayPhone(data.phone)}`} dir="ltr">
                      {displayPhone(data.phone)}
                    </a>
                  ) : undefined,
                },
                {
                  label: ta("ایمیل"),
                  value: data.email ? (
                    <a href={`mailto:${data.email}`} dir="ltr">
                      {data.email}
                    </a>
                  ) : undefined,
                },
                {
                  label: ta("موضوع"),
                  value: data.subject
                    ? contactRequestSubjectDict[data.subject] || data.subject
                    : undefined,
                },
                {
                  label: ta("زمان ثبت"),
                  value: data.submittedAt ? (
                    <FormatDate value={data.submittedAt} />
                  ) : undefined,
                },
                { label: ta("پیام"), value: data.content, wide: true },
              ]}
            />
            <CreateForm
              hookProps={{
                path: `${API}/auto/contactRequest/${data._id}`,
                method: "POST",
                successCb: () => {
                  mutate();
                },
              }}
              defaultValue={data}
              renderer={{
                status: {
                  type: "select",
                  title: ta("وضعیت"),
                  options: contactRequestStatusDict,
                },
              }}
            />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageContactRequestPage;
