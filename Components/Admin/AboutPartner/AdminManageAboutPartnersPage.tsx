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
import { ta } from "@/Components/Admin/i18n/adminText";

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
  name: { get title() {
  return ta("نام");
}, type: "text" },
  isActive: { get title() {
  return ta("فعال");
}, type: "bool" },
  order: { get title() {
  return ta("رتبه");
}, type: "number" },
  image: { get title() {
  return ta("تصویر");
}, type: "image" },
};

const AdminManageAboutPartnersPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IAboutPartner>
      create={aboutPartnerFormRenderer}
      modelName="aboutPartner"
      title={ta("همکاران ما")}
      table={({ mutate }) => ({
        name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
        isActive: {
          name: ta("وضعیت"),
          value: (node) => booleanToValue[`${node.isActive}`],
          component: (node) => <BooleanToIcon value={node.isActive} />,
          filter: "Set",
        },
        order: {
          name: ta("ترتیب"),
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
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/aboutPartner/${node._id}`)}
                title={ta("ویرایش")}
              >
                <EditIcon />
              </IconLink>
              <IconButton
                variant="Danger"
                title={ta("حذف")}
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
