"use client";
import useSWR from "swr";
import classes from "./AdminManageSpecialityPage.module.css";
import { API } from "@/Components/config";
import { ISpeciality } from "./AdminManageSpecialitiesPage";
import { fetcher } from "@/Components/helpers/fetcher";
import HandleLoading from "../UI/HandleLoading";
import WithTitle from "../UI/WithTitle";
import TabSystem from "../UI/TabSystem";
import CreateForm from "../UI/CreateForm";
import InfoIcon from "@/Components/Icons/InfoIcon";
import Button from "@/Components/UI/Button";
import usePopup from "@/Components/Hooks/usePopup";
import useProgress from "@/Components/Hooks/useProgress";
import DeleteSpecialityPopup from "./DeletSpecialityPopup";
import { adminPath } from "@/Components/helpers/adminPath";
import { useParams } from "next/navigation";

const AdminManageSpecialityPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<ISpeciality>(
    params ? `${API}/auto/speciality/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data)
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || "تخصص"}>
          <TabSystem
            name="AdminManageSpeciality"
            items={[
              {
                title: "جزئیات",
                id: "Info",
                content: (
                  <CreateForm
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: "نام" },
                      slug: { type: "text", title: "اسلاگ" },
                      summary: { type: "text", title: "خلاصه" },
                      image: { type: "image", title: "تصویر" },
                      order: { type: "number", title: "رتبه" },
                      isHome: { type: "bool", title: "نمایش در خانه" },
                      active: { type: "bool", title: "فعال" },
                    }}
                    hookProps={{
                      path: `${API}/auto/speciality/${data._id}`,
                      method: "POST",
                      successCb: () => {
                        mutate();
                      },
                    }}
                    styleManaged
                  />
                ),
                icon: <InfoIcon />,
              },
              {
                title: "عملیات",
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <Button
                    variant="Danger"
                    onClick={() =>
                      setPopup(
                        "DeleteSpeciality",
                        <DeleteSpecialityPopup
                          node={data}
                          mutate={() => push(adminPath("/speciality"))}
                        />
                      )
                    }
                  >
                    حذف
                  </Button>
                ),
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSpecialityPage;
