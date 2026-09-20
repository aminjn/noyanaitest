"use client";

import { MongoDoc } from "@/Components/Hooks/useUser";
import { Population } from "../Clinic/AdminManageClinicsPage";
import NodesManager from "../UI/NodesManager";
import { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import IconLink from "../UI/IconLink";
import { adminPath } from "@/Components/helpers/adminPath";
import EyeIcon from "@/Components/Icons/EyeIcon";
import IconButton from "../UI/IconButton";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import DeleteShitPopup from "../UI/DeleteShitPopup";
import { FormRenderer } from "../UI/CreateForm";
import OrderEditor from "../UI/OrderEditor";

export const bookingDescriptionSegments = [
  "Doctor",
  "Clinic",
  "Pharmacy",
] as const;

export type BookingDescriptionSegment =
  (typeof bookingDescriptionSegments)[number];

const bookingDescriptionSegmentDict: Record<BookingDescriptionSegment, string> =
  {
    Doctor: "پزشک",
    Clinic: "کلینیک",
    Pharmacy: "داروخانه",
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
    title: { type: "text", title: "عنوان" },
    order: { type: "number", title: "رتبه" },
    segment: {
      type: "select",
      title: "بخش",
      options: bookingDescriptionSegmentDict,
    },
    description: { type: "area", title: "توضیحات" },
    isActive: { type: "bool", title: "فعال" },
  };

const AdminManageBookingDescriptionsPage = () => {
  const { setPopup } = usePopup();

  return (
    <NodesManager<IBookingDescription>
      title="توضیحات رزرو"
      create={bookingDescriptionFormRenderer}
      modelName="bookingDescription"
      table={({ mutate }) => ({
        title: { name: "عنوان", value: (node) => node.title, filter: "Text" },
        description: {
          name: "توضیحات",
          value: (node) => node.description,
          filter: "Text",
        },
        segment: {
          name: "بخش",
          value: (node) => bookingDescriptionSegmentDict[node.segment],
          filter: "Set",
        },
        isActive: {
          name: "فعال",
          value: (node) => booleanToValue[`${node.isActive}`],
          filter: "Set",
        },
        order: {
          name: "رتبه",
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
          name: "عملیات",
          component: (node) => (
            <TableActions>
              <IconLink href={adminPath(`/bookingDescription/${node._id}`)}>
                <EyeIcon />
              </IconLink>
              <IconButton
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
