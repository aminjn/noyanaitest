"use client";

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
import EyeIcon from "@/Components/Icons/EyeIcon";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import useForm from "@/Components/Hooks/useForm";
import Form from "@/Components/UI/Form";
import PointPicker from "../UI/PointPicker";
import FormActions from "../UI/FormActions";
import Button from "@/Components/UI/Button";
import PageMetaEditor from "../PageMeta/PageMetaEditor";

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
    <PopupCard style={{ minWidth: "min(90dvw ,  40rem)" }}>
      <CreateForm
        onCancel={() => closePopup()}
        defaultValue={node}
        renderer={{
          name: { type: "text", title: "نام" },
          order: { type: "number", title: "رتبه" },
          isActive: { type: "bool", title: "فعال" },
          price: { type: "number", title: "قیمت" },
          features: { type: "strings", title: "ویژگی ها" },
          isPopular: { type: "bool", title: "محبوب" },
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
          title="طرح ها"
          actions={[
            {
              title: "جدید",
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
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              isActive: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.isActive}`],
                component: (node) => <BooleanToIcon value={node.isActive} />,
                filter: "Set",
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              price: {
                name: "قیمت",
                value: (node) => node.price,
                component: (node) => currencize(node.price),
                filter: "Number",
              },
              isPopular: {
                name: "محبوب",
                filter: "Set",
                value: (node) => booleanToValue[`${node.isPopular}`],
                component: (node) => <BooleanToIcon value={node.isPopular} />,
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
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
                      <EyeIcon />
                    </IconButton>
                    <IconButton
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
  const { setInput, submit, isLoading } = useForm<{ coords: [number, number] }>(
    {
      path: `${API}/auto/insurance/${node._id}`,
      method: "POST",
      hasProblem: (inp) => (!inp.coords ? "یک موقعیت را انتخاب کنید" : false),
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
          تایید
        </Button>
      </FormActions>
    </Form>
  );
};

const AdminManageInsurancePage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<IInsurance>(
    params ? `${API}/auto/insurance/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || data._id}>
          <TabSystem
            name="AdminManageInsurance"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                icon: <InfoIcon />,
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: {
                        title: "نام",
                        type: "text",
                      },
                      order: { title: "رتبه", type: "number" },
                      active: { title: "فعال", type: "bool" },
                      category: {
                        title: "دسته بندی",
                        type: "nodes",
                        multi: false,
                        path: `${API}/auto/insuranceCategory`,
                        getOptionLabel: (node) =>
                          (node as IInsuranceCategory).name ||
                          (node as IInsuranceCategory)._id,
                        getOptionValue: (node) =>
                          (node as IInsuranceCategory)._id,
                        getDefaultValue: (inp) => inp.category,
                      },
                      tags: {
                        type: "nodes",
                        title: "تگ ها",
                        getOptionLabel: (node) =>
                          (node as IInsuranceTag).name ||
                          (node as IInsuranceTag)._id,
                        getOptionValue: (node) => (node as IInsuranceTag)._id,
                        path: `${API}/auto/insuranceTag`,
                        multi: true,
                        getDefaultValue: (inp) => inp.tags,
                      },
                      establishment: { type: "text", title: "تاسیس" },
                      centersCount: { type: "text", title: "تعداد مراکز" },
                      doctorsCount: { type: "text", title: "تعداد پزشکان" },
                      membersCount: { type: "text", title: "تعداد اعضا" },
                      image: { type: "image", title: "تصویر" },
                      slug: { type: "text", title: "اسلاگ" },
                      phone: { type: "text", title: "تلفن" },
                      summary: { type: "text", title: "خلاصه" },
                      pharmacyCount: { type: "text", title: "تعداد داروخانه" },
                      doctorCount: { type: "text", title: "تعداد دکتر" },
                      hospitalCount: { type: "text", title: "تعداد بیمارستان" },
                      coverages: { type: "strings", title: "پوشش ها" },
                      advantages: { type: "strings", title: "مزایا" },
                      website: { type: "text", title: "سایت" },
                      address: { type: "text", title: "آدرس" },
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
                title: "لوکیشن",
                content: (
                  <InsuranceLocationManager node={data} mutate={mutate} />
                ),
              },
              {
                id: "plans",
                title: "طرح ها",
                content: <AdminManageInsurancePlans node={data} />,
              },
              {
                id: "Meta",
                title: "متادیتا",
                content: (
                  <PageMetaEditor
                    resourceType="/insurance/[slug]"
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

export default AdminManageInsurancePage;
