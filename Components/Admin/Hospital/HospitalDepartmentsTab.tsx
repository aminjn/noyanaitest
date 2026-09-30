import useSWR from "swr";
import { IHospital, IHospitalDepartment } from "./AdminManageHospitalsPage";
import classes from "./HospitalDepartmentsTab.module.css";
import { API } from "@/Components/config";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import usePopup from "@/Components/Hooks/usePopup";
import MutateHospitalDepartmentPopup from "./MutateHospitalDepartmentPopup";
import Table from "../UI/Table";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import TableActions from "../UI/TableActions";
import ImageIcon from "@/Components/UI/RTFEditor/ImageIcon";
import IconButton from "../UI/IconButton";
import FullScreenImagePopup from "@/Components/Popups/FullScreenImagePopup";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import DeleteHospitalDepartmentPopup from "./DeleteHospitalDepartmentPopup";
import { fetcher } from "@/Components/helpers/fetcher";
import OrderEditor from "../UI/OrderEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const HospitalDepartmentsTab = ({ hospital }: { hospital: IHospital }) => {
  const { data, error, mutate } = useSWR<
    IHospitalDepartment<{ DoctorsCount: true }>[]
  >(`${API}/auto/hospitaldepartment?hospital=${hospital._id}`, (url: string) =>
    fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={ta("دپارتمان ها")}
          actions={[
            {
              title: ta("جدید"),
              action: () =>
                setPopup(
                  "MutateHospitalDepartment",
                  <MutateHospitalDepartmentPopup
                    hospital={hospital}
                    mutate={mutate}
                  />,
                ),
            },
          ]}
        >
          <Table
            data={data}
            name="AdminManageHospitalDepartments"
            renderer={{
              name: { name: ta("نام"), value: (node) => node.name, filter: "Text" },
              active: {
                name: ta("وضعیت"),
                value: (node) => booleanToValue[`${node.active}`],
                filter: "Set",
                component: (node) => <BooleanToIcon value={node.active} />,
              },
              order: {
                name: ta("رتبه"),
                value: (node) => node.order,
                filter: "Number",
                component: (node) => (
                  <OrderEditor
                    value={node.order}
                    _id={node._id}
                    mutate={mutate}
                    modelName="hospitaldepartment"
                  />
                ),
              },
              doctorsCount: {
                name: ta("تعداد پزشکان"),
                value: (node) => node.doctorsCount,
                filter: "Number",
              },
              image: {
                name: ta("تصویر"),
                value: (node) => (!!node.image ? ta("دارد") : ta("ندارد")),
                component: (node) => (
                  <TableActions>
                    {node.image ? (
                      <IconButton
                        title={ta("مشاهده تصویر")}
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
                name: ta("عملیات"),
                component: (node) => (
                  <TableActions>
                    <IconButton
                      title={ta("ویرایش")}
                      variant="Info"
                      onClick={() =>
                        setPopup(
                          "MutateHospitalDepartment",
                          <MutateHospitalDepartmentPopup
                            hospital={hospital}
                            department={node}
                            mutate={mutate}
                          />,
                        )
                      }
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      title={ta("حذف")}
                      variant="Danger"
                      onClick={() =>
                        setPopup(
                          "DeleteHospitalDepartment",
                          <DeleteHospitalDepartmentPopup
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

export default HospitalDepartmentsTab;
