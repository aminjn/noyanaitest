"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import { cityPath, districtPath } from "@/Components/Admin/UI/geoPaths";
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
import PointPicker from "../UI/PointPicker";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
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
import { ta } from "@/Components/Admin/i18n/adminText";

// the shared location picker (Components/Admin/UI/PointPicker), as on the
// clinic / hospital / insurance pages
const PharmacyLocationTab = ({
  mutate,
  node,
}: {
  node: IPharmacy;
  mutate: () => unknown;
}) => {
  const { setInput, isLoading, submit } = useForm<{
    coords: [number, number];
  }>({
    path: `${API}/auto/pharmacy/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    hasProblem: (inp) =>
      !inp.coords ? ta("یک موقعیت را انتخاب کنید") : false,
    mutator: (inp) => ({
      location: { type: "Point", coordinates: inp.coords },
    }),
  });

  return (
    <div>
      <PointPicker
        defaultValue={node.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coords: e }))}
      />
      <FormActions>
        <Button isLoading={isLoading} onClick={submit}>
          {ta("تایید")}
        </Button>
      </FormActions>
    </div>
  );
};

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
                      address: {
                        type: "text",
                        title: ta("آدرس"),
                        section: ta("آدرس"),
                      },
                      avatar: { type: "image", title: ta("تصویر") },
                      banner: { type: "image", title: ta("بنر") },
                      province: {
                        title: ta("استان"),
                        section: ta("آدرس"),
                        type: "nodes",
                        path: `${API}/auto/province`,
                        getOptionLabel: (node) =>
                          (node as IProvince).name || (node as IProvince)._id,
                        getOptionValue: (node) => (node as IProvince)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.province,
                      },
                      city: {
                        title: ta("شهر"),
                        section: ta("آدرس"),
                        type: "nodes",
                        getOptionLabel: (node) =>
                          (node as ICity).name || (node as ICity)._id,
                        getOptionValue: (node) => (node as ICity)._id,
                        getDefaultValue: (inp) => inp.city,
                        multi: false,
                        path: cityPath,
                      },
                      district: {
                        title: ta("محله"),
                        section: ta("آدرس"),
                        getOptionLabel: (node) =>
                          (node as IDistrict).name || (node as IDistrict)._id,
                        type: "nodes",
                        getOptionValue: (node) => (node as IDistrict)._id,
                        getDefaultValue: (inp) => inp.district,
                        multi: false,
                        path: districtPath,
                      },
                    }}
                  />
                ),
              },
              {
                title: ta("موقعیت"),
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
