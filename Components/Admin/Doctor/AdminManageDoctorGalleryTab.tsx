import useSWR from "swr";
import classes from "./AdminManageDoctorGalleryTab.module.css";
import { IDoctor } from "./AdminManageDoctorsPage";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import Table from "../UI/Table";
import IconButton from "../UI/IconButton";
import TableActions from "../UI/TableActions";
import ImageIcon from "@/Components/UI/RTFEditor/ImageIcon";
import usePopup from "@/Components/Hooks/usePopup";
import FullScreenImagePopup from "@/Components/Popups/FullScreenImagePopup";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import MutateGalleryItemPopup from "./MutateGalleryItemPopup";
import DeleteGalleryItemPopup from "./DeleteGalleryItemPopup";
import WithTitle from "../UI/WithTitle";
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

export type GalleryItemPopulation = { OwnerPopulated?: true };

export interface IGalleryItem<
  TOwnerIsDoctor extends boolean | undefined = boolean | undefined,
  TPopulation extends GalleryItemPopulation = GalleryItemPopulation,
> extends MongoDoc {
  owner: TOwnerIsDoctor extends undefined
    ? unknown
    : TPopulation["OwnerPopulated"] extends true
      ? TOwnerIsDoctor extends true
        ? IDoctor
        : IDoctorProfile
      : string;
  ownerPath: TOwnerIsDoctor extends undefined
    ? unknown
    : TOwnerIsDoctor extends true
      ? "Doctor"
      : "DoctorProfile";
  image?: string;
  alt?: string;
  description?: string;
  createdAt: Date;
  order: number;
  active: boolean;
}

const AdminManageDoctorGalleryTab = ({ node }: { node: IDoctor }) => {
  const { data, error, mutate } = useSWR<IGalleryItem<true>[]>(
    `${API}/auto/galleryitem?owner=${node._id}`,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("گالری ${1}", [node.name])}
          actions={
            hasAccess("GalleryItem", "write")
              ? [
                  {
                    title: ta("جدید"),
                    action: () =>
                      setPopup(
                        "MutateGalleryItem",
                        <MutateGalleryItemPopup mutate={mutate} doc={node} />,
                      ),
                  },
                ]
              : undefined
          }
        >
          <Table
            data={data}
            name="AdminManageDoctorGallery"
            renderer={{
              alt: {
                name: ta("عنوان تصویر"),
                value: (node) => node.alt,
                filter: "Text",
              },
              image: {
                name: ta("تصویر"),
                value: (node) => (node.image ? ta("دارد") : ta("ندارد")),
                component: (node) =>
                  node.image ? (
                    <TableActions>
                      <IconButton
                        title={ta("نمایش تصویر")}
                        onClick={() =>
                          setPopup(
                            "FullscreenImagePreview",
                            <FullScreenImagePopup src={node.image} />,
                          )
                        }
                      >
                        <ImageIcon />
                      </IconButton>
                    </TableActions>
                  ) : (
                    "—"
                  ),
                filter: "Set",
              },
              active: {
                name: ta("فعال"),
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
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
                    modelName="galleryitem"
                    mutate={mutate}
                  />
                ),
              },
              createdAt: {
                name: ta("تاریخ ایجاد"),
                value: (node) => new Date(node.createdAt),
                filter: "Date",
              },
              actions: {
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    {hasAccess("GalleryItem", "update") && (
                      <IconButton
                        title={ta("ویرایش")}
                        onClick={() =>
                          setPopup(
                            "MutateGalleryItem",
                            <MutateGalleryItemPopup
                              mutate={mutate}
                              node={node}
                            />,
                          )
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {hasAccess("GalleryItem", "delete") && (
                      <IconButton
                        variant="Danger"
                        title={ta("حذف")}
                        onClick={() =>
                          setPopup(
                            "DeleteGalleryItem",
                            <DeleteGalleryItemPopup
                              mutate={mutate}
                              node={node}
                            />,
                          )
                        }
                      >
                        <GarbageIcon />
                      </IconButton>
                    )}
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

export default AdminManageDoctorGalleryTab;
