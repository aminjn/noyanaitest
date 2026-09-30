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
import ClinicInfoTab from "./ClinicInfoTab";
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
import PointPicker from "../UI/PointPicker";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import ClinicProfileLicenseTab from "./ClinicProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { CentreSections } from "./CentreSections";
import { ta } from "@/Components/Admin/i18n/adminText";

const ClinicLocationManager = ({
  node,
  mutate,
}: {
  node: IClinic;
  mutate: () => unknown;
}) => {
  const { setInput, submit, isLoading } = useForm<{ coords: [number, number] }>(
    {
      path: `${API}/auto/clinic/${node._id}`,
      method: "POST",
      hasProblem: (inp) =>
        !inp.coords ? ta("یک موقعیت را انتخاب کنید") : false,
      mutator: (inp) => ({
        location: { type: "Point", coordinates: inp.coords },
      }),
      successCb: () => mutate(),
    },
  );

  return (
    <Form>
      <PointPicker
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
        defaultValue={node.location?.coordinates}
      />
      <FormActions>
        <Button type="submit" onClick={submit} isLoading={isLoading}>
          {ta("تایید")}
        </Button>
      </FormActions>
    </Form>
  );
};

const AdminManageClinicPage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";

  const { data, error, mutate } = useSWR<IClinic>(
    params ? `${API}/auto/clinic/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

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
          <TabSystem
            items={[
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
                title: ta("اطلاعات"),
                icon: <InfoIcon />,
                id: "Info",
                content: <ClinicInfoTab clinic={data} mutate={mutate} />,
              },
              {
                title: ta("موقعیت"),
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
                // kept by the user's decision for parity with the other
                // centres; the rate is not applied to any payment yet
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

export default AdminManageClinicPage;
