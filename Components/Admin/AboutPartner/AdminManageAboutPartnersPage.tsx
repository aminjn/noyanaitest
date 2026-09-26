"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import NodesManager from "../UI/NodesManager";
import { Population } from "../Clinic/AdminManageClinicsPage";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconButton from "../UI/IconButton";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";

export type AboutPartnerPopulation = Population<Record<never, never>>;

export interface IAboutPartner<
  T extends AboutPartnerPopulation = AboutPartnerPopulation,
> extends MongoDoc {
  name?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

export const aboutPartnerFormRenderer: FormRenderer<IAboutPartner> = {
  name: { title: "نام", type: "text" },
  isActive: { title: "فعال", type: "bool" },
  order: { title: "رتبه", type: "number" },
  image: { title: "تصویر", type: "image" },
};

const AdminManageAboutPartnersPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IAboutPartner>
      create={aboutPartnerFormRenderer}
      modelName="aboutPartner"
      title="همکاران ما"
      table={({ mutate }) => ({
        name: { name: "نام", value: (node) => node.name, filter: "Text" },
        isActive: {
          name: "وضعیت",
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: "ترتیب",
          value: (node) => node.order,
          filter: "Number",
          component: (node) => (
            <OrderEditor
              modelName="aboutPartner"
              mutate={mutate}
              value={node.order}
              _id={node._id}
            />
          ),
        },
        actions: {
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/aboutPartner/${node._id}`)}
                title="ویرایش"
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title="حذف"
                onClick={() =>
                  setPopup(
                    "Delete",
                    <DeleteShitPopup
                      mutate={mutate}
                      modelName="aboutPartner"
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
      })}
    />
  );
};

export default AdminManageAboutPartnersPage;
