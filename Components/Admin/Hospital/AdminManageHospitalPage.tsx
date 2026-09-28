"use client";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import { useParams } from "next/navigation";
import useSWR, { mutate } from "swr";
import { HospitalPopulation, IHospital } from "./AdminManageHospitalsPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import { IHospitalCategory } from "../HospitalCategory/AdminManageHospitalCategoriesPage";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
import { IHospitalTag } from "../HospitalTag/AdminManageHospitalTagsPage";
import useForm from "@/Components/Hooks/useForm";
import PointPicker from "../UI/PointPicker";
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
import CartIcon from "@/Components/Icons/CartIcon";

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
  return (
    <PopupCard>
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
            title: "کلینیک",
            path: `${API}/auto/clinic`,
            getOptionLabel: (node) =>
              (node as IClinic).name || (node as IClinic)._id,
            getOptionValue: (node) => (node as IClinic)._id,
            getDefaultValue: (inp) => inp.clinic._id,
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
          title="کلینیک ها"
          actions={[
            {
              title: "جدید",
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
                name: "کلینیک",
                value: (node) => node.clinic?.name,
                component: (node) =>
                  node.clinic ? (
                    <InlineLink href={adminPath(`/clinic/${node.clinic._id}`)}>
                      {node.clinic.name || node.clinic._id}
                    </InlineLink>
                  ) : (
                    "—"
                  ),
                filter: "Text",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title="ویرایش"
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
                      title="حذف"
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

const HospitalLocationManager = ({
  mutate,
  node,
}: {
  node: IHospital;
  mutate: () => unknown;
}) => {
  const { setInput, isLoading, submit } = useForm<{
    coordinates: [number, number];
  }>({
    path: `${API}/auto/hospital/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    mutator: (inp) => ({
      location: { type: "Point", coordinates: inp.coordinates },
    }),
    hasProblem: (inp) => (!inp.coordinates ? "مختصات را انتخاب کنید" : false),
  });

  return (
    <div>
      <PointPicker
        defaultValue={node.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, coordinates: e }))}
      />
      <FormActions>
        <Button onClick={() => submit()} isLoading={isLoading}>
          تایید
        </Button>
      </FormActions>
    </div>
  );
};

const AdminManageHospitalPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<
    IHospital<{ User: Record<never, never> }>
  >(`${API}/auto/hospital/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageHospital"
            items={[
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: "نمای کلی",
                      content: (
                        <EntityOverview kind="hospital" nodeId={nodeId} />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                title: "اطلاعات",
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: "نام" },
                      isActive: { type: "bool", title: "فعال" },
                      order: { type: "number", title: "رتبه" },
                      slug: { type: "text", title: "اسلاگ" },
                      bedCount: { type: "number", title: "تعداد تخت" },
                      isRoundTheClock: { type: "bool", title: "24X7" },
                      special: { type: "bool", title: "ویژه" },
                      category: {
                        type: "nodes",
                        multi: false,
                        path: `${API}/auto/hospitalCategory`,
                        getOptionLabel: (node) =>
                          (node as IHospitalCategory).name ||
                          (node as IHospitalCategory)._id,
                        getOptionValue: (node) =>
                          (node as IHospitalCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                        title: "دسنه بندی",
                      },
                      province: {
                        type: "nodes",
                        path: `${API}/auto/province`,
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IProvince).name || (node as IProvince)._id,
                        getOptionValue: (node) => (node as IProvince)._id,
                        title: "استان",
                        getDefaultValue: (inp) => inp.province,
                      },
                      city: {
                        title: "شهر",
                        type: "nodes",
                        path: `${API}/auto/city`,
                        getOptionLabel: (node) =>
                          (node as ICity).name || (node as ICity)._id,
                        getOptionValue: (node) => (node as ICity)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.city,
                      },
                      district: {
                        title: "محله",
                        type: "nodes",
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IDistrict).name || (node as IDistrict)._id,
                        getOptionValue: (node) => (node as IDistrict)._id,
                        path: `${API}/auto/district`,
                        getDefaultValue: (inp) => inp.district,
                      },
                      image: { type: "image", title: "تصویر" },
                      tags: {
                        type: "nodes",
                        title: "تگ ها",
                        getOptionLabel: (node) =>
                          (node as IHospitalTag).name ||
                          (node as IHospitalTag)._id,
                        getOptionValue: (node) => (node as IHospitalTag)._id,
                        multi: true,
                        getDefaultValue: (inp) => inp.tags,
                        path: `${API}/auto/hospitalTag`,
                      },
                      code: { type: "text", title: "کد" },
                      establishment: { type: "text", title: "تاسیس" },
                      personelCount: { type: "number", title: "تغداد پرسنل" },
                      summary: { type: "text", title: "خلاصه" },
                      address: { type: "text", title: "آدرس" },
                      businessTimes: { type: "text", title: "ساعات کاری" },
                      mail: { type: "text", title: "ایمیل" },
                      owner: {
                        type: "nodes",
                        title: "صاحب",
                        path: `${API}/auto/doctorProfile`,
                        getOptionLabel: (node) =>
                          getDoctorProfileLabel(node as IDoctorProfile),
                        getOptionValue: (node) => (node as IDoctorProfile)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.owner,
                      },
                      phone: { type: "text", title: "شماره تماس" },
                      website: { type: "text", title: "سایت" },
                      services: { type: "strings", title: "حدمات" },
                      insurances: {
                        type: "nodes",
                        title: "بیمه ها",
                        getOptionLabel: (node) =>
                          (node as IInsurance).name || (node as IInsurance)._id,
                        getOptionValue: (node) => (node as IInsurance)._id,
                        path: `${API}/auto/insurance`,
                        multi: true,
                        getDefaultValue: (inp) => inp.insurances,
                      },
                      certificates: {
                        type: "strings",
                        title: "اعتبار نامه ها",
                      },
                    }}
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
              {
                title: "موقعیت",
                id: "Geo",
                content: (
                  <HospitalLocationManager node={data} mutate={mutate} />
                ),
              },
              {
                title: "کلینیک ها",
                id: "Clinic",
                content: <HospitalClinicsManager node={data} />,
              },
              {
                title: "یوزر",
                id: "User",
                content: <HospitalUserTab node={data} mutate={mutate} />,
              },
              {
                title: "دپارتمان ها",
                id: "Departments",
                content: <HospitalDepartmentsTab hospital={data} />,
              },
              {
                title: "پزشکان",
                id: "Doctors",
                content: <HospitalDoctorsTab hospital={data} />,
              },
              {
                title: "مجوز",
                id: "License",
                icon: <CartIcon />,
                content: <HospitalProfileLicenseTab node={data} />,
              },
              {
                title: "متادیتا",
                id: "Meta",
                content: (
                  <PageMetaEditor
                    resourceType="/hospital/[slug]"
                    slug={data.slug}
                  />
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageHospitalPage;
