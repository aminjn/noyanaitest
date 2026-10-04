"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
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
import CreateForm, { FormRenderer } from "../UI/CreateForm";
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
import AdminLocationTab, {
  newRecordLocationFields,
} from "../UI/AdminLocationTab";
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
import DeleteShitPopup from "../UI/DeleteShitPopup";
import useProgress from "@/Components/Hooks/useProgress";
import { CentreSection, CentreSections } from "../Clinic/CentreSections";
import PanelOwnerSection from "../Clinic/PanelOwnerSection";
import {
  ProviderStatusBanner,
  ProviderStatusFields,
  useProviderStatusActions,
} from "../UI/ProviderStatus";
import { ta } from "@/Components/Admin/i18n/adminText";
import AdminRecordEditor from "../UI/AdminRecordEditor";

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
            // a test missing from the catalog is added from here
            creatable: { path: `${API}/auto/test` },
          },
          price: {
            type: "number",
            title: ta("قیمت"),
            price: true,
            required: true,
          },
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
                      {node.test.name || ta("بدون نام")}
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

// The paraclinic's record fields: its info tab and the one form of a new paraclinic (`/paraClinic/new`)
export const paraClinicInfoRenderer = (): FormRenderer<IParaClinic> => ({
  name: { type: "text", title: ta("نام"), required: true },
  order: { type: "number", title: ta("رتبه") },
  active: { type: "bool", title: ta("فعال") },
  special: { type: "bool", title: ta("ویژه") },
  category: {
    type: "nodes",
    title: ta("دسته بندی"),
    multi: false,
    getOptionLabel: (node) =>
      (node as IParaClinicCategory).name || (node as IParaClinicCategory)._id,
    getOptionValue: (node) => (node as IParaClinicCategory)._id,
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
      (node as IParaClinicTag).name || (node as IParaClinicTag)._id,
    getOptionValue: (node) => (node as IParaClinicTag)._id,
    getDefaultValue: (inp) => inp.tags,
    multi: true,
  },
  image: { type: "image", title: ta("تصویر") },
  slug: { type: "text", title: ta("اسلاگ") },
  establishment: { type: "text", title: ta("تاسیس") },
  businessTime: {
    type: "text",
    title: ta("ساعات کاری"),
    section: ta("تماس"),
  },
  phone: { type: "text", title: ta("تلفن"), section: ta("تماس") },
  onlineResponse: { type: "bool", title: ta("پاسخ آنلاین") },
  onPremises: { type: "bool", title: ta("نمونه گیری در محل") },
  personelCount: { type: "number", title: ta("کادر تخصصی") },
  summary: { type: "area", title: ta("خلاصه") },
  insurances: {
    type: "nodes",
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

const ParaClinicGeoManager = ({
  mutate,
  node,
}: {
  node: IParaClinic;
  mutate: () => unknown;
}) => (
  <AdminLocationTab
    path={`${API}/auto/paraClinic/${node._id}`}
    node={node as never}
    mutate={mutate}
  />
);

const ParaClinicRecordPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<
    IParaClinic<{ User: Record<never, never> }>
  >(`${API}/auto/paraClinic/${nodeId}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();
  const statusActions = useProviderStatusActions({
    kind: "paraClinic",
    node: data as unknown as ProviderStatusFields | undefined,
    mutate,
  });

  // overview / details (+ gallery) / location / tests / panel owner /
  // money (commission + tax, both read at checkout) / license / SEO /
  // translations; delete in the header
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
                  "DeleteParaClinic",
                  <DeleteShitPopup
                    modelName="paraClinic"
                    nodeId={data._id}
                    mutate={() => push(adminPath("/paraClinic"))}
                  />,
                ),
            },
          ]}
        >
          <ProviderStatusBanner
            node={data as unknown as ProviderStatusFields}
          />
          <TabSystem
            name="AdminManageParaClinic"
            items={[
              // the record itself first: the same fields as the "new" form
              {
                id: "Info",
                title: ta("اطلاعات"),
                content: (
                  <CentreSections>
                    <CreateForm
                      defaultValue={data}
                      layout="sections"
                      renderer={paraClinicInfoRenderer()}
                      hookProps={{
                        path: `${API}/auto/paraClinic/${data._id}`,
                        method: "POST",
                        successCb: () => {
                          mutate();
                        },
                      }}
                    />
                    <ImagesManager model="ParaClinic" node={data} />
                  </CentreSections>
                ),
              },
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
                id: "Geo",
                title: ta("آدرس و موقعیت"),
                content: <ParaClinicGeoManager mutate={mutate} node={data} />,
              },
              {
                id: "Tests",
                title: ta("آزمایش ها"),
                content: (
                  <CentreSections>
                    <ParaClinicTestManager paraClinic={data} />
                  </CentreSections>
                ),
              },
              {
                id: "Owner",
                title: ta("مالک پنل"),
                content: (
                  <PanelOwnerSection
                    node={data}
                    mutate={mutate}
                    modelName="paraClinic"
                  />
                ),
              },
              {
                id: "Finance",
                title: ta("مالی"),
                content: (
                  <CentreSections>
                    <CentreSection title={ta("کمیسیون")}>
                      <ParaClinicCommissionTab node={data} />
                    </CentreSection>
                    <CentreSection title={ta("مالیات")}>
                      <ParaClinicTaxTab node={data} />
                    </CentreSection>
                  </CentreSections>
                ),
              },
              {
                id: "License",
                title: ta("مجوز"),
                icon: <CartIcon />,
                content: <ParaClinicProfileLicenseTab node={data} />,
              },
              {
                id: "Meta",
                title: ta("سئو"),
                content: (
                  <PageMetaEditor
                    resourceType="/paraClinic/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="paraClinic" />,
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
const AdminManageParaClinicPage = () => {
  const { nodeId } = useParams<{ nodeId: string }>();
  if (nodeId === "new")
    return (
      <AdminRecordEditor<IParaClinic>
        segment="paraClinic"
        path="/paraClinic"
        nodeId="new"
        newTitle={ta("پاراکلینیک جدید")}
        titleOf={(node) => node.name || ""}
        renderer={{ ...paraClinicInfoRenderer(), ...newRecordLocationFields() }}
      />
    );
  return <ParaClinicRecordPage />;
};

export default AdminManageParaClinicPage;
