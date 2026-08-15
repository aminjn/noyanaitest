import useSWR from "swr";
import { IClinic, IClinicDepartment } from "./AdminManageClinicsPage";
import classes from "./ClinicDepartmentsTab.module.css";
import { API } from "@/Components/config";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateClinicDepartmentPopup from "./MutateClinicDepartmentPopup";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import ImageIcon from "@/Components/UI/RTFEditor/ImageIcon";
import IconButton from "../UI/IconButton";
import FullScreenImagePopup from "@/Components/Popups/FullScreenImagePopup";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteClinicDepartmentPopup from "./DeleteClinicDepartmentPopup";
import { fetcher } from "@/Components/helpers/fetcher";

const ClinicDepartmentsTab = ({ clinic }: { clinic: IClinic }) => {
  const { data, error, mutate } = useSWR<
    IClinicDepartment<{ DoctorsCount: true }>[]
  >(`${API}/auto/clinicdepartment?clinic=${clinic._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={`دپارتمان های کلینیک ${clinic.name || clinic._id}`}
          actions={[
            {
              title: "جدید",
              action: () =>
                setPopup(
                  "MutateClinicDepartment",
                  <MutateClinicDepartmentPopup
                    clinic={clinic}
                    mutate={mutate}
                  />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageClinicDepartments"
            renderer={{
              name: { name: "نام", value: (node) => node.name, filter: "Text" },
              description: {
                name: "توضیحات",
                value: (node) => node.description,
                filter: "Text",
              },
              active: {
                name: "فعال",
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              order: {
                name: "رتبه",
                value: (node) => node.order,
                filter: "Number",
              },
              doctorsCount: {
                name: "تعداد پزشکان",
                value: (node) => node.doctorsCount,
                filter: "Number",
              },
              image: {
                name: "تصویر",
                value: (node) => (!!node.image ? "دارد" : "ندارد"),
                component: (node) => (
                  <TableActions>
                    {node.image ? (
                      <IconButton
                        onClick={() =>
                          setPopup(
                            "FullscreenImagePreview",
                            <FullScreenImagePopup src={node.image} />,
                          )
                        }
                      >
                        <ImageIcon />
                      </IconButton>
                    ) : (
                      ""
                    )}
                  </TableActions>
                ),
                filter: "Set",
              },
              actions: {
                name: "عملیات",
                component: (node) => (
                  <TableActions>
                    <IconButton
                      variant="Info"
                      onClick={() =>
                        setPopup(
                          "MutateClinicDepartment",
                          <MutateClinicDepartmentPopup
                            clinic={clinic}
                            department={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteClinicDepartment",
                          <DeleteClinicDepartmentPopup
                            mutate={mutate}
                            node={node}
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

export default ClinicDepartmentsTab;
