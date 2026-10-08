"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import { API } from "@/Components/config";
import { IPharmacy } from "@/Components/DoctorPanel/Pharmacy/DoctorPharmaciesTab";
import { fetcher } from "@/Components/helpers/fetcher";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm, { FormRenderer } from "../UI/CreateForm";
import useForm from "@/Components/Hooks/useForm";
import AdminLocationTab, {
  newRecordLocationFields,
} from "../UI/AdminLocationTab";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import WalletIcon from "@/Components/Icons/WalletIcon";
import PharmacyCommissionTab from "./PharmacyCommissionTab";
import PharmacyTaxTab from "./PharmacyTaxTab";
import PharmacyProfileLicenseTab from "./PharmacyProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import DeletePharmacyPopup from "./DeletePharmacyPopup";
import { CentreSection, CentreSections } from "../Clinic/CentreSections";
import CentreLicenceSection from "../Clinic/CentreLicenceSection";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";
import {
  ProviderStatusBanner,
  ProviderStatusFields,
  useProviderStatusActions,
} from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";

// The pharmacy's record fields: its info tab and the one form of a new pharmacy (`/pharmacy/new`)
export const pharmacyInfoRenderer = (): FormRenderer<IPharmacy> => ({
  name: { title: ta("نام"), type: "text", required: true },
  slug: { title: ta("اسلاگ"), type: "text" },
  active: { type: "bool", title: ta("فعال") },
  order: { type: "number", title: ta("رتبه") },
  summary: { type: "area", title: ta("خلاصه") },
  avatar: { type: "image", title: ta("تصویر") },
  banner: { type: "image", title: ta("بنر") },
  // what the pharmacy panel and the public page show
  // (2026-10): the admin form now edits the same fields
  phone: { type: "text", title: ta("تلفن"), section: ta("تماس") },
  businessTime: {
    type: "text",
    title: ta("یادداشت ساعات کاری"),
    section: ta("تماس"),
  },
  // the structured week (2026-10, backend Lib/openingHours.ts): its
  // round-the-clock switch is the centre's isRoundTheClock
  openingHours: { type: "openingHours", title: ta("ساعات کاری هفتگی") },
  // the insurers with an active contract (2026-10): they change through
  // the contract (the centre's panel and the insurer's), not here
  insurances: {
    type: "nodes",
    readOnly: true,
    hint: ta("از قراردادهای فعال بیمه می‌آید و از اینجا تغییر نمی‌کند"),
    title: ta("بیمه ها"),
    section: ta("بیمه‌ها"),
    getOptionLabel: (node) =>
      (node as IInsurance).name || (node as IInsurance)._id,
    getOptionValue: (node) => (node as IInsurance)._id,
    multi: true,
    getDefaultValue: (inp) => inp.insurances,
    path: `${API}/auto/insurance`,
  },
});

// the shared location tab (Components/Admin/UI/AdminLocationTab)
const PharmacyLocationTab = ({
  mutate,
  node,
}: {
  node: IPharmacy;
  mutate: () => unknown;
}) => (
  <AdminLocationTab
    path={`${API}/auto/pharmacy/${node._id}`}
    node={node as never}
    mutate={mutate}
  />
);

const PharmacyRecordPage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const hasAccess = useAccessLevel();
  const { data, error, mutate } = useSWR<IPharmacy>(
    params ? `${API}/auto/pharmacy/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const statusActions = useProviderStatusActions({
    kind: "pharmacy",
    node: data as unknown as ProviderStatusFields | undefined,
    mutate,
  });

  // overview / details / location / panel owner / money (commission + tax,
  // both read at checkout) / license / SEO / translations; delete in the
  // header. The details form now covers every field the public pharmacy
  // page shows (slug, avatar, banner, summary, address).
  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={data.name || ta("بدون نام")}
          actions={[
            ...statusActions,
            ...(hasAccess("Pharmacy", "delete")
              ? [
                  {
                    title: ta("حذف"),
                    danger: true,
                    action: () =>
                      setPopup(
                        "DeletePharmacy",
                        <DeletePharmacyPopup
                          node={data}
                          mutate={() => push(adminPath("/pharmacy"))}
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
            name="AdminManagePharmacy"
            items={[
              // the record itself first: the same fields as the "new" form
              {
                title: ta("اطلاعات"),
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    layout="sections"
                    hookProps={{
                      path: `${API}/auto/pharmacy/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    renderer={pharmacyInfoRenderer()}
                  />
                ),
              },
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview
                          kind="pharmacy"
                          nodeId={params?.nodeId || ""}
                        />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                title: ta("آدرس و موقعیت"),
                content: <PharmacyLocationTab node={data} mutate={mutate} />,
                id: "Location",
              },
              {
                title: ta("مالک پنل"),
                id: "Owner",
                content: (
                  <PanelOwnerSection
                    node={data}
                    mutate={mutate}
                    modelName="pharmacy"
                  />
                ),
              },
              // admin-only endpoints (no access level): staff would get an error
              ...(isAdmin
                ? [
                    {
                      title: ta("مالی"),
                      id: "Finance",
                      icon: <WalletIcon />,
                      content: (
                        <CentreSections>
                          <CentreSection title={ta("کمیسیون")}>
                            <PharmacyCommissionTab node={data} />
                          </CentreSection>
                          <CentreSection title={ta("مالیات")}>
                            <PharmacyTaxTab node={data} />
                          </CentreSection>
                        </CentreSections>
                      ),
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
                      // the operating licence (the verified tick) and the NoyanAI
                      // plan, the centre's two licences
                      content: (
                        <CentreSections>
                          <CentreLicenceSection kind="pharmacy" nodeId={data._id} />
                          <CentreSection
                            title={ta("اشتراک نویان")}
                            hint={ta("ماژول‌های پنل مرکز و تاریخ پایان اشتراک آن.")}
                          >
                            <PharmacyProfileLicenseTab node={data} />
                          </CentreSection>
                        </CentreSections>
                      ),
                    },
                  ]
                : []),
              {
                title: ta("سئو"),
                id: "Meta",
                content: (
                  <PageMetaEditor
                    resourceType="/pharmacy/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="pharmacy" />,
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
const AdminManagePharmacyPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IPharmacy>
        segment="pharmacy"
        path="/pharmacy"
        nodeId="new"
        newTitle={ta("داروخانه‌ی جدید")}
        titleOf={(node) => node.name || ""}
        renderer={{ ...pharmacyInfoRenderer(), ...newRecordLocationFields() }}
      />
    );
  return <PharmacyRecordPage />;
};

export default AdminManagePharmacyPage;
