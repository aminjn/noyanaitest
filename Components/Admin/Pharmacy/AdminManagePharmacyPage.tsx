"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
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
import CreateForm from "../UI/CreateForm";
import useForm from "@/Components/Hooks/useForm";
import AdminLocationTab from "../UI/AdminLocationTab";
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
import PanelOwnerSection from "../Clinic/PanelOwnerSection";
import {
  ProviderStatusBanner,
  ProviderStatusFields,
  useProviderStatusActions,
} from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";

// the shared location tab (Components/Admin/UI/AdminLocationTab)
const PharmacyLocationTab = ({ mutate, node }: { node: IPharmacy; mutate: () => unknown }) => (
  <AdminLocationTab path={`${API}/auto/pharmacy/${node._id}`} node={node as never} mutate={mutate} />
);

const AdminManagePharmacyPage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
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
          ]}
        >
          <ProviderStatusBanner node={data as unknown as ProviderStatusFields} />
          <TabSystem
            name="AdminManagePharmacy"
            items={[
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
                    renderer={{
                      name: { title: ta("نام"), type: "text" },
                      slug: { title: ta("اسلاگ"), type: "text" },
                      active: { type: "bool", title: ta("فعال") },
                      order: { type: "number", title: ta("رتبه") },
                      summary: { type: "area", title: ta("خلاصه") },
                      avatar: { type: "image", title: ta("تصویر") },
                      banner: { type: "image", title: ta("بنر") },
                    }}
                  />
                ),
              },
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
              {
                title: ta("مجوز"),
                id: "License",
                icon: <CartIcon />,
                content: <PharmacyProfileLicenseTab node={data} />,
              },
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

export default AdminManagePharmacyPage;
