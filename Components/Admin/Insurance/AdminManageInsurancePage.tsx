"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
import EntityOverview from "../UI/EntityOverview";
import useUser from "@/Components/Hooks/useUser";
import DashboardIcon from "@/Components/Icons/DashboardIcon";

import useSWR from "swr";
import TabSystem from "../UI/TabSystem";
import {
  IInsurance,
  InsurancePopulation,
} from "@/Components/DoctorPanel/Insurance/DoctorInsurancesTab";
import { useParams } from "next/navigation";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import InfoIcon from "@/Components/Icons/InfoIcon";
import CreateForm from "../UI/CreateForm";
import { IInsuranceCategory } from "../InsuranceCategory/AdminManageInsuranceCategoriesPage";
import { IInsuranceTag } from "../InsuranceTag/AdminManageInsuranceTagsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { currencize } from "@/Components/helpers/currencize";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import EditIcon from "@/Components/Icons/EditIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import PointPicker from "../UI/PointPicker";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import OrderEditor from "../UI/OrderEditor";
import InsuranceUserTab from "./InsuranceUserTab";
import InsuranceProfileLicenseTab from "./InsuranceProfileLicenseTab";
import CartIcon from "@/Components/Icons/CartIcon";
import useProgress from "@/Components/Hooks/useProgress";
import { adminPath } from "@/Components/helpers/adminPath";
import DeleteInsurancePopup from "./DeleteInsurancePopup";
import { CentreSections } from "../Clinic/CentreSections";
import { ta } from "@/Components/Admin/i18n/adminText";

export type InsurancePlanPopulation = Population<{
  Insurance: InsurancePopulation;
}>;

export interface IInsurancePlan<
  T extends InsurancePlanPopulation = InsurancePlanPopulation,
> extends MongoDoc {
  insurance: T["Insurance"] extends InsurancePopulation
    ? IInsurance<T["Insurance"]>
    : string;
  name?: string;
  isActive: boolean;
  order: number;
  price: number;
  features: string[];
  isPopular: boolean;
}

const MutateInsurancePlanPopup = ({
  mutate,
  insurance,
  node,
}: { mutate: () => unknown } & (
  | { node: IInsurancePlan; insurance?: never }
  | { insurance: IInsurance; node?: never }
)) => {
  const { closePopup } = usePopup();

  return (
    <PopupCard
      title={node ? ta("ویرایش طرح بیمه") : ta("طرح بیمه جدید")}
      style={{ minWidth: "min(90dvw, 40rem)" }}
    >
      <CreateForm
        onCancel={() => closePopup()}
        defaultValue={node}
        renderer={{
          name: { type: "text", title: ta("نام") },
          order: { type: "number", title: ta("رتبه") },
          isActive: { type: "bool", title: ta("فعال") },
          price: { type: "number", title: ta("قیمت"), price: true },
          features: { type: "strings", title: ta("ویژگی ها") },
          isPopular: { type: "bool", title: ta("محبوب") },
        }}
        hookProps={{
          path: `${API}/auto/insurancePlan${node ? `/${node._id}` : ""}`,
          method: "POST",
          decorators: insurance ? { insurance: insurance._id } : undefined,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const AdminManageInsurancePlans = ({ node }: { node: IInsurance }) => {
  const { data, error, mutate } = useSWR<IInsurancePlan[]>(
    `${API}/auto/insurancePlan?insurance=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("طرح ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "Create",
                  <MutateInsurancePlanPopup mutate={mutate} insurance={node} />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageInsurancePlans"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              price: {
                name: ta("قیمت"),
                value: (node) => node.price,
                component: (node) => currencize(node.price),
                filter: "Number",
              },
              isActive: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    modelName="insurancePlan"
                    _id={node._id}
                    mutate={mutate}
                  />
                ),
              },
              isPopular: {
                name: ta("محبوب"),
                filter: "Set",
                value: (node) => booleanToValue[`${node.isPopular}`],
                component: (node) => <BooleanToIcon value={node.isPopular} />,
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
                      onClick={() =>
                        setPopup(
                          "Mutate",
                          <MutateInsurancePlanPopup
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
                          <DeleteShitPopup
                            modelName="insurancePlan"
                            mutate={mutate}
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

const InsuranceLocationManager = ({
  node,
  mutate,
}: {
  node: IInsurance;
  mutate: () => unknown;
}) => {
  const { setInput, submit, isLoading, input } = useForm<{ coords: [number, number]; address: string }>(
    {
      path: `${API}/auto/insurance/${node._id}`,
      method: "POST",
      hasProblem: (inp) => (!inp.coords && !inp.address ? ta("یک موقعیت را انتخاب کنید") : false),
      mutator: (inp) => ({
        ...(inp.coords ? { location: { type: "Point", coordinates: inp.coords } } : {}),
      // the point's address, when the admin took it (or it was empty)
      ...(inp.address?.trim() ? { address: inp.address.trim() } : {}),
      }),
      successCb: () => mutate(),
    },
  );

  return (
    <Form>
      <PointPicker
        currentAddress={input.address ?? node.address ?? ""}
        onUseAddress={(address) => setInput((prev) => ({ ...prev, address }))}
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

const AdminManageInsurancePage = () => {
  const params = useParams<{ nodeId: string }>();
  // Entity 360 tab (its endpoint is full-admin only)
  const isAdmin = useUser(true).user?.role === "admin";
  const { data, error, mutate } = useSWR<
    IInsurance<{ User: Record<never, never> }>
  >(params ? `${API}/auto/insurance/${params.nodeId}` : null, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();
  const push = useProgress();

  // overview / details / location / plans / panel owner / license / SEO /
  // translations; delete in the header
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
                  "DeleteInsurance",
                  <DeleteInsurancePopup
                    node={data}
                    mutate={() => push(adminPath("/insurance"))}
                  />,
                ),
            },
          ]}
        >
          <TabSystem
            name="AdminManageInsurance"
            items={[
              ...(isAdmin
                ? [
                    {
                      id: "Overview",
                      title: ta("نمای کلی"),
                      content: (
                        <EntityOverview
                          kind="insurance"
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
                    renderer={{
                      name: {
                        title: ta("نام"),
                        type: "text",
                      },
                      order: { title: ta("رتبه"), type: "number" },
                      active: { title: ta("فعال"), type: "bool" },
                      category: {
                        title: ta("دسته بندی"),
                        type: "nodes",
                        multi: false,
                        path: `${API}/auto/insuranceCategory`,
                        creatable: { path: `${API}/auto/insuranceCategory` },
                        getOptionLabel: (node) =>
                          (node as IInsuranceCategory).name ||
                          (node as IInsuranceCategory)._id,
                        getOptionValue: (node) =>
                          (node as IInsuranceCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                      },
                      tags: {
                        type: "nodes",
                        title: ta("تگ ها"),
                        getOptionLabel: (node) =>
                          (node as IInsuranceTag).name ||
                          (node as IInsuranceTag)._id,
                        getOptionValue: (node) => (node as IInsuranceTag)._id,
                        path: `${API}/auto/insuranceTag`,
                        creatable: { path: `${API}/auto/insuranceTag` },
                        multi: true,
                        getDefaultValue: (inp) => inp.tags,
                      },
                      establishment: { type: "text", title: ta("تاسیس") },
                      membersCount: { type: "text", title: ta("تعداد اعضا") },
                      image: { type: "image", title: ta("تصویر") },
                      slug: { type: "text", title: ta("اسلاگ") },
                      phone: { type: "text", title: ta("تلفن"), section: ta("تماس") },
                      summary: { type: "area", title: ta("خلاصه") },
                      coverages: { type: "strings", title: ta("پوشش ها") },
                      advantages: { type: "strings", title: ta("مزایا") },
                      website: { type: "text", title: ta("سایت"), section: ta("تماس") },
                      address: { type: "text", title: ta("آدرس"), section: ta("تماس") },
                    }}
                    hookProps={{
                      path: `${API}/auto/insurance/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                  />
                ),
              },
              {
                id: "Location",
                title: ta("موقعیت"),
                content: (
                  <InsuranceLocationManager node={data} mutate={mutate} />
                ),
              },
              {
                id: "plans",
                title: ta("طرح ها"),
                content: (
                  <CentreSections>
                    <AdminManageInsurancePlans node={data} />
                  </CentreSections>
                ),
              },
              {
                title: ta("مالک پنل"),
                id: "User",
                content: <InsuranceUserTab node={data} mutate={mutate} />,
              },
              {
                title: ta("مجوز"),
                id: "License",
                icon: <CartIcon />,
                content: <InsuranceProfileLicenseTab node={data} />,
              },
              {
                id: "Meta",
                title: ta("سئو"),
                content: (
                  <PageMetaEditor
                    resourceType="/insurance/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="insurance" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageInsurancePage;
