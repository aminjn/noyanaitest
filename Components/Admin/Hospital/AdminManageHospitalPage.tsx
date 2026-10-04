"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import { useParams } from "next/navigation";
import useSWR from "swr";
import {
  DeleteHospitalPopup,
  HospitalPopulation,
  IHospital,
} from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import { IHospitalCategory } from "../HospitalCategory/AdminManageHospitalCategoriesPage";
import { IHospitalTag } from "../HospitalTag/AdminManageHospitalTagsPage";
import useForm from "@/Components/Hooks/useForm";
import AdminLocationTab, {
  newRecordLocationFields,
} from "../UI/AdminLocationTab";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import {
  ClinicPopulation,
  IClinic,
  Population,
} from "../Clinic/AdminManageClinicsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { getDoctorProfileLabel } from "../Lib/LabelGetters";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import HospitalUserTab from "./HospitalUserTab";
import HospitalDepartmentsTab from "./HospitalDepartmentsTab";
import HospitalDoctorsTab from "./HospitalDoctorsTab";
import HospitalProfileLicenseTab from "./HospitalProfileLicenseTab";
import HospitalTaxTab from "./HospitalTaxTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { CentreSections } from "../Clinic/CentreSections";
import useProgress from "@/Components/Hooks/useProgress";
import {
  ProviderStatusBanner,
  ProviderStatusFields,
  useProviderStatusActions,
} from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

export type HospitalClinicPopulation = Population<{
  Hospital: HospitalPopulation;
  Clinic: ClinicPopulation;
}>;

export interface IHospitalClinic<
  T extends HospitalClinicPopulation = HospitalClinicPopulation,
> extends MongoDoc {
  hospital: T["Hospital"] extends HospitalPopulation
    ? IHospital<T["Hospital"]>
    : string;
  clinic: T["Clinic"] extends ClinicPopulation ? IClinic<T["Clinic"]> : string;
}

const MutateHospitalClinicPopup = ({
  mutate,
  hospital,
  node,
}: { mutate: () => unknown } & (
  | {
      node: IHospitalClinic<{ Clinic: Record<never, never> }>;
      hospital?: never;
    }
  | { hospital: IHospital; node?: never }
)) => {
  const { closePopup } = usePopup();
  // A clinic that works inside this hospital (HospitalClinic: one
  // hospital per clinic). Not a «بخش»: the hospital's own units are its
  // departments, on the same team tab.
  return (
    <PopupCard
      title={
        node ? ta("ویرایش کلینیک بیمارستان") : ta("افزودن کلینیک به بیمارستان")
      }
    >
      <CreateForm
        defaultValue={node}
        onCancel={() => closePopup()}
        hookProps={{
          path: `${API}/auto/hospitalClinic${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          decorators: hospital ? { hospital: hospital._id } : undefined,
        }}
        renderer={{
          clinic: {
            type: "nodes",
            title: ta("کلینیک"),
            path: `${API}/auto/clinic`,
            getOptionLabel: (node) => (node as IClinic).name || ta("بدون نام"),
            getOptionValue: (node) => (node as IClinic)._id,
            getDefaultValue: (inp) => inp.clinic?._id,
            multi: false,
          },
        }}
      />
    </PopupCard>
  );
};

const HospitalClinicsManager = ({ node }: { node: IHospital }) => {
  const { data, error, mutate } = useSWR<
    IHospitalClinic<{ Clinic: Record<never, never> }>[]
  >(`${API}/auto/hospitalClinic?hospital=${node._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("کلینیک ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateHospitalClinic",
                  <MutateHospitalClinicPopup hospital={node} mutate={mutate} />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageHospitalClinics"
            data={data}
            renderer={{
              clinic: {
                name: ta("کلینیک"),
                value: (node) => node.clinic?.name,
                component: (node) =>
                  node.clinic ? (
                    <InlineLink href={adminPath(`/clinic/${node.clinic._id}`)}>
                      {node.clinic.name || ta("بدون نام")}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
                filter: "Text",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "MutateHospitalClinic",
                          <MutateHospitalClinicPopup
                            node={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      title={ta("حذف")}
                      onClick={() =>
                        setPopup(
                          "DeleteHospitalClinic",
                          <DeleteShitPopup
                            mutate={mutate}
                            modelName="hospitalClinic"
                            nodeId={node._id}
                          />,
                        )
                      }
                    >
                      <GarbageIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
            }}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

// The hospital's record fields: its info tab and the one form of a new hospital (`/hospital/new`)
export const hospitalInfoRenderer = (
  // a saved hospital: its manager is picked from its own doctors
  nodeId?: string,
): FormRenderer<IHospital> => ({
  name: { type: "text", title: ta("نام"), required: true },
  isActive: { type: "bool", title: ta("فعال") },
  order: { type: "number", title: ta("رتبه") },
  slug: { type: "text", title: ta("اسلاگ") },
  bedCount: { type: "number", title: ta("تعداد تخت") },
  isRoundTheClock: { type: "bool", title: ta("شبانه‌روزی") },
  special: { type: "bool", title: ta("ویژه") },
  category: {
    type: "nodes",
    multi: false,
    path: `${API}/auto/hospitalCategory`,
    creatable: { path: `${API}/auto/hospitalCategory` },
    getOptionLabel: (node) =>
      (node as IHospitalCategory).name || (node as IHospitalCategory)._id,
    getOptionValue: (node) => (node as IHospitalCategory)._id,
    getDefaultValue: (inp) => inp.category,
    title: ta("دسته بندی"),
  },
  image: { type: "image", title: ta("تصویر") },
  tags: {
    type: "nodes",
    title: ta("تگ ها"),
    getOptionLabel: (node) =>
      (node as IHospitalTag).name || (node as IHospitalTag)._id,
    getOptionValue: (node) => (node as IHospitalTag)._id,
    multi: true,
    getDefaultValue: (inp) => inp.tags,
    path: `${API}/auto/hospitalTag`,
    creatable: { path: `${API}/auto/hospitalTag` },
  },
  code: { type: "text", title: ta("کد") },
  establishment: { type: "text", title: ta("تاسیس") },
  personelCount: { type: "number", title: ta("تعداد پرسنل") },
  summary: { type: "area", title: ta("خلاصه") },
  businessTimes: {
    type: "text",
    title: ta("ساعات کاری"),
    section: ta("تماس"),
  },
  mail: { type: "text", title: ta("ایمیل"), section: ta("تماس") },
  phone: {
    type: "text",
    title: ta("شماره تماس"),
    section: ta("تماس"),
  },
  website: { type: "text", title: ta("سایت"), section: ta("تماس") },
  services: { type: "strings", title: ta("خدمات") },
  insurances: {
    type: "nodes",
    title: ta("بیمه ها"),
    section: ta("بیمه‌ها"),
    getOptionLabel: (node) =>
      (node as IInsurance).name || (node as IInsurance)._id,
    getOptionValue: (node) => (node as IInsurance)._id,
    path: `${API}/auto/insurance`,
    multi: true,
    getDefaultValue: (inp) => inp.insurances,
  },
  certificates: {
    type: "strings",
    title: ta("اعتبار نامه ها"),
  },
  ...(nodeId
    ? {
        owner: {
          type: "nodes",
          // shown on the public page as «مدیریت»; not the panel owner
          title: ta("پزشک مدیر (از پزشکان همین بیمارستان)"),
          // only the hospital's own doctors (2026-10)
          path: `${API}/auto/hospitaldoctor?hospital=${nodeId}`,
          getOptionLabel: (node) => {
            const doctor = (node as { doctor?: IDoctorProfile }).doctor;
            return doctor ? getDoctorProfileLabel(doctor) : "";
          },
          getOptionValue: (node) =>
            (node as { doctor?: IDoctorProfile }).doctor?._id || "",
          multi: false,
          getDefaultValue: (inp) => {
            const owner = inp.owner as unknown;
            return owner && typeof owner === "object"
              ? (owner as { _id?: string })._id
              : owner;
          },
        },
      }
    : {}),
});

const HospitalLocationManager = ({
  mutate,
  node,
}: {
  node: IHospital;
  mutate: () => unknown;
}) => (
  <AdminLocationTab
    path={`${API}/auto/hospital/${node._id}`}
    node={node as never}
    mutate={mutate}
  />
);

const HospitalRecordPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const hasAccess = useAccessLevel();
  const { data, error, mutate } = useSWR<
    IHospital<{ User: Record<never, never> }>
  >(`${API}/auto/hospital/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const statusActions = useProviderStatusActions({
    kind: "hospital",
    node: data as unknown as ProviderStatusFields | undefined,
    mutate,
  });

  // Same short set of tabs as the clinic page: overview, details,
  // location, team (panel owner, doctors, departments, clinics inside the
  // hospital), license, SEO, translations; delete in the header.
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            ...statusActions,
            ...(hasAccess("Hospital", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeleteHospital",
                        <DeleteHospitalPopup
                          node={data}
                          mutate={() => push(adminPath("/hospital"))}
                        />,
                      ),
                  },
                ]
              : []),
          ]}
        >
          <ProviderStatusBanner
            node={data as unknown as ProviderStatusFields}
          />
          <TabSystem
            name="AdminManageHospital"
            items={[
              // the record itself first: the same fields as the "new" form
              {
                title: ta("اطلاعات"),
                content: (
                  <CreateForm
                    defaultValue={data}
                    layout="sections"
                    renderer={hospitalInfoRenderer(data._id)}
                    hookProps={{
                      path: `${API}/auto/hospital/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                  />
                ),
                id: "Details",
              },
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview kind="hospital" nodeId={nodeId} />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                title: ta("آدرس و موقعیت"),
                id: "Geo",
                content: (
                  <HospitalLocationManager node={data} mutate={mutate} />
                ),
              },
              {
                title: ta("تیم"),
                id: "Team",
                content: (
                  <CentreSections>
                    <HospitalUserTab node={data} mutate={mutate} />
                    <HospitalDoctorsTab hospital={data} />
                    <HospitalDepartmentsTab hospital={data} />
                    <HospitalClinicsManager node={data} />
                  </CentreSections>
                ),
              },
              ...(isAdmin
                ? [
                    {
                      // the hospital's visit tax for in-person visits in
                      // its offices (tax settings are admin-only)
                      title: ta("مالی"),
                      id: "Tax",
                      content: <HospitalTaxTab node={data} />,
                    },
                  ]
                : []),
              // admin-only endpoints (no access level): staff would get an error
              ...(isAdmin
                ? [
                    {
                      title: ta("مجوز"),
                      id: "License",
                      icon: <CartIcon />,
                      content: <HospitalProfileLicenseTab node={data} />,
                    },
                  ]
                : []),
              {
                title: ta("سئو"),
                id: "Meta",
                content: (
                  <PageMetaEditor
                    resourceType="/hospital/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="hospital" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

// "New" is this route with `new`: every field of the record in one form,
// saved once (Components/Admin/UI/AdminRecordEditor), then this page with
// its other tabs
const AdminManageHospitalPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IHospital>
        segment="hospital"
        path="/hospital"
        nodeId="new"
        newTitle={ta("بیمارستان جدید")}
        titleOf={(node) => node.name || ""}
        renderer={{ ...hospitalInfoRenderer(), ...newRecordLocationFields() }}
      />
    );
  return <HospitalRecordPage />;
};

export default AdminManageHospitalPage;
