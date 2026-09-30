"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EditIcon from "@/Components/Icons/EditIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export const bookingDescriptionSegments = [
  "Doctor",
  "Clinic",
  "Pharmacy",
] as const;

export type BookingDescriptionSegment =
  (typeof bookingDescriptionSegments)[number];

const bookingDescriptionSegmentDict: Record<BookingDescriptionSegment, string> =
  {
    get Doctor() {
  return ta("پزشک");
},
    get Clinic() {
  return ta("کلینیک");
},
    get Pharmacy() {
  return ta("داروخانه");
},
  };

export type BookingDescriptionPopulation = Population<Record<never, never>>;

export interface IBookingDescription<
  T extends BookingDescriptionPopulation = BookingDescriptionPopulation,
> extends MongoDoc {
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  segment: BookingDescriptionSegment;
}

export const bookingDescriptionFormRenderer: FormRenderer<IBookingDescription> =
  {
    title: { type: "text", get title() {
  return ta("عنوان");
} },
    order: { type: "number", get title() {
  return ta("رتبه");
} },
    segment: {
      type: "select",
      get title() {
  return ta("بخش");
},
      options: bookingDescriptionSegmentDict,
    },
    description: { type: "area", get title() {
  return ta("توضیحات");
} },
    isActive: { type: "bool", get title() {
  return ta("فعال");
} },
  };

const AdminManageBookingDescriptionsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBookingDescription>
      title={ta("توضیحات رزرو")}
      create={bookingDescriptionFormRenderer}
      modelName="bookingDescription"
      table={({ mutate }) => ({
        title: { name: ta("عنوان"), value: (node) => node.title, filter: "Text" },
        segment: {
          name: ta("بخش"),
          value: (node) => bookingDescriptionSegmentDict[node.segment],
          filter: "Set",
        },
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
              value={node.order}
              _id={node._id}
              modelName="bookingDescription"
              mutate={mutate}
            />
          ),
        },
        actions: {
          name: ta("عملیات"),
          component: (node) => (
            <TableActions>
              <IconLink
                href={adminPath(`/bookingDescription/${node._id}`)}
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
                      modelName="bookingDescription"
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

export default AdminManageBookingDescriptionsPage;
