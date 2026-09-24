import { IGalleryItem } from "@/Components/Admin/Doctor/AdminManageDoctorGalleryTab";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import IconButton from "@/Components/Admin/UI/IconButton";
import Table from "@/Components/Admin/UI/Table";
import TableActions from "@/Components/Admin/UI/TableActions";
import WithTitle from "@/Components/Admin/UI/WithTitle";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import EditIcon from "@/Components/Icons/EditIcon";
import EyeIcon from "@/Components/Icons/EyeIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import FullScreenImagePopup from "@/Components/Popups/FullScreenImagePopup";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import useSWR from "swr";
import MutateGalleryItemPopup from "./MutateGalleryItemPopup";
import DeleteGalleryItemPopup from "./DeleteGalleryItemPopup";
import classes from "./DoctorManageGalleryTab.module.css";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "doctorPanelProfile"];

const DoctorManageGalleryTab = () => {
  const { data, error, mutate } = useSWR<IGalleryItem[]>(
    `${API}/doctor/gallery`,
    (url: string) => fetcher({ url }).then((res) => res.data)
  );

  const getContent = useScopedLocale(NS);

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          className={classes.main}
          title={getContent("gallery")}
          actions={[
            {
              title: getContent("newItem"),
              action: () =>
                setPopup(
                  "MutateGalleryItem",
                  <MutateGalleryItemPopup mutate={mutate} />
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="DoctorManageGallery"
            renderer={{
              alt: {
                name: getContent("alt"),
                value: (node) => node.alt,
                filter: "Text",
              },
              description: {
                name: getContent("description"),
                value: (node) => node.description,
                filter: "Text",
              },
              order: {
                name: getContent("order"),
                value: (node) => node.order,
                filter: "Number",
              },
              active: {
                name: getContent("isActive"),
                filter: "Set",
                value: (node) => booleanToValue[`${node.active}`],
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              image: {
                name: getContent("image"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "FullScreenImage",
                          <FullScreenImagePopup src={node.image} />
                        )
                      }
                      variant="Success"
                    >
                      <EyeIcon />
                    </IconButton>
                  </TableActions>
                ),
              },
              actions: {
                name: getContent("actions"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      onClick={() =>
                        setPopup(
                          "MutateGalleryItem",
                          <MutateGalleryItemPopup
                            mutate={mutate}
                            defaultValue={node}
                          />
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteGalleryItem",
                          <DeleteGalleryItemPopup mutate={mutate} node={node} />
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

export default DoctorManageGalleryTab;
