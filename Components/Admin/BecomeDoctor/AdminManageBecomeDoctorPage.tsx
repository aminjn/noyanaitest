"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import ApproveBecomeRequestButton from "../UI/ApproveBecomeRequestButton";
import {
  genderDict,
  IBecomeDoctorRequest,
} from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import TabSystem from "../UI/TabSystem";
import WithTitle from "../UI/WithTitle";
import InfoIcon from "@/Components/Icons/InfoIcon";
import InlineLink from "../UI/InlineLink";
import FormatDate from "@/Components/UI/FormatDate";
import { adminPath } from "@/Components/helpers/adminPath";
import { provinces } from "@/Components/Enums/Provinces";
import { cities } from "@/Components/Enums/Cities";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import BecomeDoctorProfileSelector from "./BecomeDoctorProfileSelector";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import { ta } from "@/Components/Admin/i18n/adminText";
import RequestDecisionBanner from "../BecomeRequest/RequestDecisionBanner";
import RequestInfoGrid from "../BecomeRequest/RequestInfoGrid";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import pageClasses from "../BecomeRequest/BecomeRequestPage.module.css";
import classes from "./AdminManageBecomeDoctorPage.module.css";
import CouncilCardChecklist, { CouncilChecklistItem, councilChecklistItems } from "./CouncilCardChecklist";

type DoctorRequest = IBecomeDoctorRequest<{
  SpecialitiesPopulated: true;
  UserPopulated: true;
}> & {
  decidedAt?: string;
  // the one onboarding flow (2026-10, backend doctorOnboardingController)
  verification?: "inquiry" | "manual";
  council?: { title?: string; city?: string; acquiredAt?: string };
  claimProfile?: { _id: string; firstName?: string; lastName?: string; slug?: string; user?: string } | null;
  councilCard?: string;
  councilCheckedAt?: string;
  licenseDoc?: string;
  officePermit?: string;
};

const docFields = ["councilCard", "licenseDoc", "officePermit"] as const;
const docLabel = (field: (typeof docFields)[number]) =>
  field === "councilCard" ? ta("کارت نظام پزشکی") : field === "licenseDoc" ? ta("پروانه طبابت") : ta("پروانه مطب");

// A doctor's "become a doctor" request (2026-09): the decision on top (the
// approve button creates the doctor profile from the stated specialities),
// the applicant's statement as a read-only grid, and - for staff who can
// see doctor profiles - the tab to attach an existing profile instead.
const AdminManageBecomeDoctorPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<DoctorRequest | null>(
    params?.nodeId ? `${API}/auto/becomedoctor/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data ?? null),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const hasAccess = useAccessLevel();
  // the reviewer's checklist of a request without the council inquiry
  const [checked, setChecked] = useState<Record<CouncilChecklistItem, boolean>>({
    name: false,
    code: false,
    title: false,
    speciality: false,
    authentic: false,
  });

  if (!data) return <HandleLoading data={false} error={error} />;

  const user = data.user && typeof data.user === "object" ? data.user : null;
  const specialities = (
    Array.isArray(data.specialities) ? data.specialities : []
  ).filter((s) => s && typeof s === "object" && s._id);
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(" ");
  const manual = data.verification === "manual";
  const councilChecked = !manual || councilChecklistItems.every((k) => checked[k]);

  const info = (
    <div className={pageClasses.body}>
      {manual && (
        <CouncilCardChecklist
          requestId={data._id}
          status={data.status}
          fullName={fullName}
          code={data.medicalSystemCode}
          title={data.medicalSystemTitle}
          specialities={specialities.map((sp) => sp.name || "").filter(Boolean)}
          hasCard={!!data.councilCard}
          checked={checked}
          onChange={setChecked}
          checkedAt={data.councilCheckedAt}
        />
      )}
      <RequestInfoGrid
        title={ta("متقاضی")}
        items={[
          {
            label: ta("کاربر"),
            value: user?._id ? (
              <InlineLink href={adminPath(`/user/${user._id}`)}>
                {user.phone || ta("مشاهده کاربر")}
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
        title={ta("اطلاعات شخصی")}
        items={[
          { label: ta("نام"), value: data.firstName },
          { label: ta("نام خانوادگی"), value: data.lastName },
          { label: ta("کد ملی"), value: data.ssid },
          {
            label: ta("جنسیت"),
            value: data.gender ? genderDict[data.gender] : undefined,
          },
        ]}
      />
      <RequestInfoGrid
        title={ta("نظام پزشکی")}
        items={[
          {
            label: ta("عنوان نظام پزشکی"),
            value: data.medicalSystemTitle
              ? ta(data.medicalSystemTitle)
              : undefined,
          },
          { label: ta("کد نظام پزشکی"), value: data.medicalSystemCode },
          {
            label: ta("نحوه تأیید کد"),
            wide: true,
            value:
              data.verification === "inquiry"
                ? ta("تأییدشده با استعلام نظام پزشکی")
                : data.verification === "manual"
                  ? ta("بدون استعلام؛ کد را با کارت نظام پزشکی بررسی کنید")
                  : ta("فرم قدیمی"),
          },
          ...(data.council?.title
            ? [
                { label: ta("عنوان رشته در نظام پزشکی"), value: data.council.title },
                { label: ta("شهر"), value: data.council.city },
                { label: ta("تاریخ"), value: data.council.acquiredAt },
              ]
            : []),
          ...(data.claimProfile && typeof data.claimProfile === "object" && data.claimProfile._id
            ? [
                {
                  label: ta("صفحه موجود برای واگذاری"),
                  wide: true,
                  value: (
                    <InlineLink href={adminPath(`/doctorprofile/${data.claimProfile._id}`)}>
                      {[data.claimProfile.firstName, data.claimProfile.lastName].filter(Boolean).join(" ") ||
                        data.claimProfile._id}
                    </InlineLink>
                  ),
                },
              ]
            : []),
          {
            label: ta("تخصص ها"),
            wide: true,
            value: specialities.length ? (
              <span className={classes.chips}>
                {specialities.map((speciality) => (
                  <InlineLink
                    key={speciality._id}
                    href={adminPath(`/speciality/${speciality._id}`)}
                  >
                    {speciality.name || ta("بدون نام")}
                  </InlineLink>
                ))}
              </span>
            ) : undefined,
          },
        ]}
      />
      <RequestInfoGrid
        title={ta("مدارک")}
        items={docFields.map((field) => ({
          label: docLabel(field),
          value: data[field] ? (
            <a
              href={`${API}/admin/becomedoctor/${data._id}/file/${field}`}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.file}
            >
              {ta("مشاهده فایل")}
            </a>
          ) : (
            ta("بارگذاری نشده")
          ),
        }))}
      />
      <RequestInfoGrid
        title={ta("نشانی")}
        items={[
          {
            label: ta("استان"),
            value: provinces.find((p) => p.slug === data.province)?.name,
          },
          {
            label: ta("شهر"),
            value: cities.find((c) => c.slug === data.city)?.name,
          },
          { label: ta("آدرس"), value: data.address, wide: true },
          { label: ta("توضیحات"), value: data.description, wide: true },
        ]}
      />
    </div>
  );

  const showProfile = !!user?._id && hasAccess("DoctorProfile", "readAll");

  return (
    <WithTitle
      title={
        fullName
          ? ta("درخواست پزشک شدن: ${1}", [fullName])
          : ta("درخواست پزشک شدن")
      }
      actions={
        hasAccess("BecomeDoctorRequest", "delete")
          ? [
              {
                title: ta("حذف"),
                danger: true,
                action: () =>
                  setPopup(
                    "DeleteBecomeDoctor",
                    <DeleteShitPopup
                      modelName="becomedoctor"
                      nodeId={data._id}
                      mutate={() =>
                        push(adminPath("/requests?group=become&kind=doctor"))
                      }
                    />,
                  ),
              },
            ]
          : undefined
      }
    >
      <div className={pageClasses.body}>
        <RequestDecisionBanner
          group="become"
          kind="doctor"
          nodeId={data._id}
          status={data.status}
          rejectReason={data.rejectReason}
          createdAt={data.createdAt}
          decidedAt={data.decidedAt}
          mutate={mutate}
          approve={
            !councilChecked ? undefined : <ApproveBecomeRequestButton
              requestPath="becomedoctor"
              nodeId={data._id}
              status={data.status}
              label={ta("تأیید و ساخت پروفایل پزشک")}
              done={ta("پنل پزشک فعال شد؛ صفحه پس از تکمیل اطلاعات نوبت‌دهی خودکار منتشر می‌شود.")}
              target={(id) => `/doctorprofile/${id}`}
              mutate={mutate}
              payload={manual ? { councilChecked: true } : undefined}
            />
          }
        />
        {showProfile ? (
          <TabSystem
            name="AdminManageBecomeDoctor"
            items={[
              {
                id: "Input",
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                content: info,
              },
              {
                id: "Profile",
                title: ta("پروفایل پزشک"),
                icon: <InfoIcon />,
                content: <BecomeDoctorProfileSelector
                    req={data}
                    mutateRequest={mutate}
                    needsCouncilCheck={manual}
                    councilChecked={councilChecked}
                  />,
              },
            ]}
          />
        ) : (
          info
        )}
      </div>
    </WithTitle>
  );
};

export default AdminManageBecomeDoctorPage;
