"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import useSWR from "swr";
import { IClinic } from "./AdminManageClinicsPage";
import { API } from "@/Components/config";
import { useParams } from "next/navigation";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import InfoIcon from "@/Components/Icons/InfoIcon";
import ClinicInfoTab, { clinicInfoRenderer } from "./ClinicInfoTab";
import ClinicDepartmentsTab from "./ClinicDepartmentsTab";
import ClinicDoctorsTab from "./ClinicDoctorsTab";
import ClinicUserTab from "./ClinicUserTab";
import ClinicTaxTab from "./ClinicTaxTab";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteClinicPopup from "./DeleteClinicPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import LocationIcon from "@/Components/Icons/LocationIcon";
import AdminLocationTab, {
  newRecordLocationFields,
} from "../UI/AdminLocationTab";
import AdminRecordEditor from "../UI/AdminRecordEditor";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import ClinicProfileLicenseTab from "./ClinicProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { CentreSections } from "./CentreSections";
import {
  ProviderStatusBanner,
  ProviderStatusFields,
  useProviderStatusActions,
} from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";

const ClinicLocationManager = ({
  mutate,
  node,
}: {
  node: IClinic;
  mutate: () => unknown;
}) => (
  <AdminLocationTab
    path={`${API}/auto/clinic/${node._id}`}
    node={node as never}
    mutate={mutate}
  />
);

const ClinicRecordPage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";

  const { data, error, mutate } = useSWR<IClinic>(
    params ? `${API}/auto/clinic/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();
  const statusActions = useProviderStatusActions({
    kind: "clinic",
    node: data as unknown as ProviderStatusFields | undefined,
    mutate,
  });

  // Few tabs, as in the Doctolib Pro / Practo Ray back-offices: overview,
  // details, location, team (panel owner + doctors + departments),
  // license, SEO, translations. Delete sits in the header behind a
  // confirmation. The per-clinic tax setting was dropped: no checkout or
  // payout reads it (Lib/taxSettings.ts getClinicTaxPercent is unused).
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
              //TODO: server-side clean up of the clinic's departments and doctor relations
              action: () =>
                setPopup(
                  "DeleteClinic",
                  <DeleteClinicPopup
                    node={data}
                    mutate={() => push(adminPath("/clinic"))}
                  />,
                ),
            },
          ]}
        >
          <ProviderStatusBanner
            node={data as unknown as ProviderStatusFields}
          />
          <TabSystem
            items={[
              // the record itself first: the same fields as the new-clinic form
              {
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                id: "Info",
                content: <ClinicInfoTab clinic={data} mutate={mutate} />,
              },
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview
                          kind="clinic"
                          nodeId={params?.nodeId || ""}
                        />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                title: ta("آدرس و موقعیت"),
                id: "GEO",
                icon: <LocationIcon />,
                content: <ClinicLocationManager mutate={mutate} node={data} />,
              },
              {
                title: ta("تیم"),
                id: "Team",
                icon: <InfoIcon />,
                content: (
                  <CentreSections>
                    <ClinicUserTab node={data} mutate={mutate} />
                    <ClinicDoctorsTab clinic={data} />
                    <ClinicDepartmentsTab clinic={data} />
                  </CentreSections>
                ),
              },
              {
                // the clinic's rate for in-person visits in its offices
                title: ta("مالی"),
                id: "Tax",
                icon: <InfoIcon />,
                content: <ClinicTaxTab node={data} />,
              },
              {
                title: ta("مجوز"),
                id: "License",
                icon: <CartIcon />,
                content: <ClinicProfileLicenseTab node={data} />,
              },
              {
                title: ta("سئو"),
                icon: <InfoIcon />,
                id: "Meta",
                content: (
                  <PageMetaEditor
                    resourceType="/clinic/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="clinic" />,
              },
            ]}
            name="AdminManageClinic"
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

// "New clinic" is this route with `new`: every field of the record in one
// form, saved once (Components/Admin/UI/AdminRecordEditor), then the
// clinic's page with its team, license and finance tabs
const AdminManageClinicPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IClinic>
        segment="clinic"
        path="/clinic"
        nodeId="new"
        newTitle={ta("کلینیک جدید")}
        titleOf={(node) => node.name || ""}
        renderer={{ ...clinicInfoRenderer(), ...newRecordLocationFields() }}
      />
    );
  return <ClinicRecordPage />;
};

export default AdminManageClinicPage;
