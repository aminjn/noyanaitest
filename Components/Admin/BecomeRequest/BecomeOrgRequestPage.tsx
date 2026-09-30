"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { adminPath } from "@/Components/helpers/adminPath";
import FormatDate from "@/Components/UI/FormatDate";
import { ta } from "@/Components/Admin/i18n/adminText";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import InlineLink from "../UI/InlineLink";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import { requestUserId } from "../Requests/requestMeta";
import RequestDecisionBanner from "./RequestDecisionBanner";
import RequestInfoGrid from "./RequestInfoGrid";
import RequestDocument from "./RequestDocument";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { AccessLevelModel } from "../AccessLevel/AdminManageAccessLevelsPage";
import classes from "./BecomeRequestPage.module.css";

// the shared shape of the centre "become X" requests (clinic, hospital,
// pharmacy, para-clinic, insurance) - Models/Become*Request.ts
type OrgRequest = {
  _id: string;
  user?: { _id: string; phone?: string } | string | null;
  createdAt?: string;
  status?: string;
  rejectReason?: string;
  decidedAt?: string;
  name?: string;
  siamCode?: string;
  nationalId?: string;
  certificateDate?: string;
  certificateFile?: string;
  description?: string;
};

export type BecomeOrgRequestKind = {
  // RequestDecisionActions kind: "clinic" | "hospital" | ...
  kind: "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";
  // /auto/<requestPath>/:id and /admin/<requestPath>/:id/approve
  requestPath: string;
  // the access-level model guarding the request (delete permission)
  accessModel: AccessLevelModel;
  // the centre's own auto segment and admin route, e.g. "clinic"
  orgPath: string;
  title: string;
  approveLabel: string;
  approveDone: string;
  selectLabel: string;
};

// One read-only page for every centre "become X" request (2026-09): the
// decision banner on top, the applicant's statement below as a label /
// value grid. The five kinds had five copies of the same page.
const BecomeOrgRequestPage = ({ config }: { config: BecomeOrgRequestKind }) => {
  const params = useParams<{ nodeId: string }>();
  const nodeId = params?.nodeId ? String(params.nodeId) : "";
  const { data, error, mutate } = useSWR<OrgRequest | null>(
    nodeId ? `${API}/auto/${config.requestPath}/${nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();

  const user = data && typeof data.user === "object" ? data.user : null;
  const userId = requestUserId(data?.user);

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={config.title}
          actions={
            hasAccess(config.accessModel, "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteBecomeRequest",
                        <DeleteShitPopup
                          modelName={config.requestPath}
                          nodeId={nodeId}
                          mutate={() =>
                            push(
                              adminPath(
                                `/requests?group=become&kind=${config.kind}`,
                              ),
                            )
                          }
                        />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <div className={classes.body}>
            <RequestDecisionBanner
              group="become"
              kind={config.kind}
              nodeId={nodeId}
              status={data.status}
              rejectReason={data.rejectReason}
              createdAt={data.createdAt}
              decidedAt={data.decidedAt}
              mutate={mutate}
              approve={
                <ApproveBecomeRequestButton
                  requestPath={config.requestPath}
                  nodeId={nodeId}
                  status={data.status}
                  label={config.approveLabel}
                  done={config.approveDone}
                  target={(id) => `/${config.orgPath}/${id}`}
                  mutate={mutate}
                />
              }
              linkExisting={{
                requestPath: config.requestPath,
                orgPath: `${API}/auto/${config.orgPath}`,
                label: config.selectLabel,
                target: (id) => `/${config.orgPath}/${id}`,
                applicantUser: userId,
              }}
            />
            <RequestInfoGrid
              title={ta("متقاضی")}
              items={[
                {
                  label: ta("کاربر"),
                  value: userId ? (
                    <InlineLink href={adminPath(`/user/${userId}`)}>
                      {user?.phone || ta("مشاهده کاربر")}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
                },
                {
                  label: ta("تاریخ ثبت"),
                  value: data.createdAt ? (
                    <FormatDate value={data.createdAt} />
                  ) : undefined,
                },
              ]}
            />
            <RequestInfoGrid
              title={ta("اطلاعات مرکز")}
              items={[
                { label: ta("نام"), value: data.name },
                { label: ta("کد سیام"), value: data.siamCode },
                { label: ta("کد ملی"), value: data.nationalId },
                {
                  label: ta("تاریخ گواهی"),
                  value: data.certificateDate ? (
                    <FormatDate value={data.certificateDate} time={false} />
                  ) : undefined,
                },
                { label: ta("توضیحات"), value: data.description, wide: true },
              ]}
            />
            <RequestInfoGrid
              title={ta("مدارک")}
              items={[
                {
                  label: ta("فایل گواهی"),
                  value: (
                    <RequestDocument
                      file={data.certificateFile}
                      label={ta("فایل گواهی")}
                    />
                  ),
                },
              ]}
            />
          </div>
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default BecomeOrgRequestPage;
