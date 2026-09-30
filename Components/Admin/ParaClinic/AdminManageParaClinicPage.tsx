"use client";
import { cityPath, districtPath } from "@/Components/Admin/UI/geoPaths";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import {
  IParaClinic,
  ParaClinicPopulation,
} from "@/Components/Layout/ParaClinicPanelLayout";
import { useParams } from "next/navigation";
import useSWR from "swr";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import CreateForm from "../UI/CreateForm";
import { getUserLabel } from "../Lib/LabelGetters";
import { IUser, MongoDoc } from "@/Components/Hooks/useUser";
import TabSystem from "../UI/TabSystem";
import { Population } from "../Clinic/AdminManageClinicsPage";
import { ITest, TestPopulation } from "../Test/AdminManageTestsPage";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { Fragment, useState } from "react";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import Table from "../UI/Table";
import InlineLink from "../UI/InlineLink";
import { adminPath } from "@/Components/helpers/adminPath";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import { IParaClinicTag } from "../ParaClinicTag/AdminManageParaClinicTagsPage";
import { IParaClinicCategory } from "../ParaClinicCategory/AdminManageParaClinicCategoriesPage";
import {
  ICity,
  IDistrict,
  IProvince,
} from "../Province/AdminManageProvincesPage";
import PointPicker from "../UI/PointPicker";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import ImagesManager from "../Product/ImagesManager";
import { IInsurance } from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import ParaClinicCommissionTab from "./ParaClinicCommissionTab";
import ParaClinicTaxTab from "./ParaClinicTaxTab";
import ParaClinicProfileLicenseTab from "./ParaClinicProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

export type ParaClinicTestPopulation = Population<{
  Test: TestPopulation;
  ParaClinic: ParaClinicPopulation;
}>;

export interface IParaClinicTest<
  T extends ParaClinicTestPopulation = ParaClinicTestPopulation,
> extends MongoDoc {
  test: T["Test"] extends TestPopulation ? ITest<T["Test"]> : string;
  price: number;
  paraClinic: T["ParaClinic"] extends ParaClinicPopulation
    ? IParaClinic<T["ParaClinic"]>
    : string;
  readyTime?: string;
}

const MutateParaClinicTestPopup = ({
  mutate,
  node,
  paraClinic,
}: { mutate: () => unknown } & (
  | {
      node: IParaClinicTest<{ Test: Record<never, never> }>;
      paraClinic?: never;
    }
  | { paraClinic: IParaClinic; node?: never }
)) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard title={node ? ta("ویرایش آزمایش مرکز") : ta("آزمایش مرکز جدید")}>
      <CreateForm
        onCancel={() => closePopup()}
        defaultValue={node}
        hookProps={{
          path: `${API}/auto/paraClinicTest${node ? `/${node._id}` : ""}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
          decorators: paraClinic ? { paraClinic: paraClinic._id } : undefined,
        }}
        renderer={{
          test: {
            type: "nodes",
            title: ta("آزمایش"),
            path: `${API}/auto/test`,
            getOptionLabel: (node) =>
              (node as ITest).name || (node as ITest)._id,
            getOptionValue: (node) => (node as ITest)._id,
            getDefaultValue: (inp) => inp.test?._id,
            multi: false,
          },
          price: { type: "number", title: ta("قیمت") },
          readyTime: { type: "text", title: ta("زمان آماده سازی") },
        }}
      />
    </PopupCard>
  );
};

const DeleteParaClinicTestPopup = ({
  mutate,
  node,
}: {
  node: IParaClinicTest;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { closePopup } = usePopup();
  return (
    <Fragment>
      <ConfirmationPopup
        onConfirm={() => setIsLoading(true)}
        message={ta("آیا از حذف این مورد مطمئنید؟")}
        isLoading={isLoading}
      />
      <Act
        path={isLoading ? `${API}/auto/paraClinicTest/${node._id}` : null}
        method="PUT"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
          closePopup();
        }}
      />
    </Fragment>
  );
};

const ParaClinicTestManager = ({ paraClinic }: { paraClinic: IParaClinic }) => {
  const { data, error, mutate } = useSWR<
    IParaClinicTest<{ Test: Record<never, never> }>[]
  >(`${API}/auto/paraClinicTest?paraClinic=${paraClinic._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("آزمایشات")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "Create",
                  <MutateParaClinicTestPopup
                    mutate={mutate}
                    paraClinic={paraClinic}
                  />,
                ),
            },
          ]}
        >
          <Table
            name="AdminManageParaClinicTests"
            data={data}
            renderer={{
              test: {
                name: ta("آزمایش"),
                value: (node) => node.test?.name || ta("حذف شده"),
                component: (node) =>
                  node.test ? (
                    <InlineLink href={adminPath(`/test/${node.test._id}`)}>
                      {node.test.name || node.test._id}
                    </InlineLink>
                  ) : (
                    ta("حذف شده")
                  ),
                filter: "Multi",
              },
              price: {
                name: ta("قیمت"),
                value: (node) => node.price,
                filter: "Number",
              },
              readyTime: {
                name: ta("زمان جوابدهی"),
                value: (node) => node.readyTime,
                filter: "Text",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Info"
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "Edit",
                          <MutateParaClinicTestPopup
                            mutate={mutate}
                            node={node}
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
                          "Delete",
                          <DeleteParaClinicTestPopup
                            node={node}
                            mutate={mutate}
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

const ParaClinicGeoManager = ({
  mutate,
  node,
}: {
  node: IParaClinic;
  mutate: () => unknown;
}) => {
  const { setInput, submit, isLoading } = useForm<{
    location: [number, number];
  }>({
    path: `${API}/auto/paraClinic/${node._id}`,
    method: "POST",
    successCb: () => {
      mutate();
    },
    hasProblem: (inp) => {
      if (!inp.location) return ta("لطفا موقعیت را انتخاب کنید");
      return false;
    },
    mutator: (inp) => ({
      location: { type: "Point", coordinates: inp.location },
    }),
  });

  return (
    <div>
      <PointPicker
        defaultValue={node.location?.coordinates}
        onChange={(e) => setInput((prev) => ({ ...prev, location: e }))}
      />
      <FormActions>
        <Button onClick={submit}>{ta("تایید")}</Button>
      </FormActions>
    </div>
  );
};

const AdminManageParaClinicPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<
    IParaClinic<{ User: Record<never, never> }>
  >(`${API}/auto/paraClinic/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageClinic"
            items={[
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview kind="paraClinic" nodeId={nodeId} />
                      ),
                      icon: <DashboardIcon />,
                    },
                  ]
                : []),
              {
                id: "Info",
                title: ta("اطلاعات"),
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: ta("نام") },
                      order: { type: "number", title: ta("رتبه") },
                      active: { type: "bool", title: ta("فعال") },
                      user: {
                        type: "nodes",
                        title: ta("کاربر"),
                        getOptionLabel: (node) => getUserLabel(node as IUser),
                        getOptionValue: (node) => (node as IUser)._id,
                        multi: false,
                        getDefaultValue: (inp) => inp.user?._id,
                        path: `${API}/auto/user`,
                      },
                      special: { type: "bool", title: ta("ویژه") },
                      category: {
                        type: "nodes",
                        title: ta("دسته بندی"),
                        multi: false,
                        getOptionLabel: (node) =>
                          (node as IParaClinicCategory).name ||
                          (node as IParaClinicCategory)._id,
                        getOptionValue: (node) =>
                          (node as IParaClinicCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                        path: `${API}/auto/paraClinicCategory`,
                        creatable: { path: `${API}/auto/paraClinicCategory` },
                      },
                      tags: {
                        type: "nodes",
                        title: ta("تگ ها"),
                        path: `${API}/auto/paraClinicTag`,
                        creatable: { path: `${API}/auto/paraClinicTag` },
                        getOptionLabel: (node) =>
                          (node as IParaClinicTag).name ||
                          (node as IParaClinicTag)._id,
                        getOptionValue: (node) => (node as IParaClinicTag)._id,
                        getDefaultValue: (inp) => inp.tags,
                        multi: true,
                      },
                      province: {
                        type: "nodes",
                        title: ta("استان"),
                        path: `${API}/auto/province`,
                        getOptionLabel: (node) =>
                          (node as IProvince).name || (node as IProvince)._id,
                        getOptionValue: (node) => (node as IProvince)._id,
                        getDefaultValue: (inp) => inp.province,
                      },
                      city: {
                        type: "nodes",
                        title: ta("شهر"),
                        path: cityPath,
                        getOptionLabel: (node) =>
                          (node as ICity).name || (node as ICity)._id,
                        getOptionValue: (node) => (node as ICity)._id,
                        getDefaultValue: (inp) => inp.city,
                      },
                      district: {
                        type: "nodes",
                        title: ta("مخله"),
                        path: districtPath,
                        getOptionLabel: (node) =>
                          (node as IDistrict).name || (node as IDistrict)._id,
                        getOptionValue: (node) => (node as IDistrict)._id,
                        getDefaultValue: (inp) => inp.district,
                      },
                      image: { type: "image", title: ta("نصویر") },
                      slug: { type: "text", title: ta("اسلاگ") },
                      establishment: { type: "text", title: ta("تاسیس") },
                      businessTime: { type: "text", title: ta("ساعات کاری") },
                      phone: { type: "text", title: ta("تلفن") },
                      basicInsurance: { type: "bool", title: ta("بیمه پایه") },
                      onlineResponse: { type: "bool", title: ta("پاسخ آنلاین") },
                      onPremises: { type: "bool", title: ta("نمونه گیری در محل") },
                      personelCount: { type: "number", title: ta("کادر تخصصی") },
                      summary: { type: "text", title: ta("خلاصه") },
                      insurances: {
                        type: "nodes",
                        title: ta("بیمه ها"),
                        getOptionLabel: (node) =>
                          (node as IInsurance).name || (node as IInsurance)._id,
                        getOptionValue: (node) => (node as IInsurance)._id,
                        multi: true,
                        getDefaultValue: (inp) => inp.insurances,
                        path: `${API}/auto/insurance`,
                      },
                      address: { type: "text", title: ta("آدرس") },
                    }}
                    hookProps={{
                      path: `${API}/auto/paraClinic/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                  />
                ),
              },
              {
                id: "Images",
                title: ta("تصاویر"),
                content: <ImagesManager model="ParaClinic" node={data} />,
              },
              {
                id: "Tests",
                title: ta("آزمایش ها"),
                content: <ParaClinicTestManager paraClinic={data} />,
              },
              {
                id: "Geo",
                title: ta("موقعیت"),
                content: <ParaClinicGeoManager mutate={mutate} node={data} />,
              },
              {
                id: "Meta",
                title: ta("متادیتا"),
                content: (
                  <PageMetaEditor
                    resourceType="/paraClinic/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "Commission",
                title: ta("کمیسیون"),
                content: <ParaClinicCommissionTab node={data} />,
              },
              {
                id: "Tax",
                title: ta("مالیات"),
                content: <ParaClinicTaxTab node={data} />,
              },
              {
                id: "License",
                title: ta("مجوز"),
                icon: <CartIcon />,
                content: <ParaClinicProfileLicenseTab node={data} />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageParaClinicPage;
