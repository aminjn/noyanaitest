"use client";
import AdminContentTranslationPage from "@/Components/Admin/ContentTranslation/AdminContentTranslationPage";
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
import useAccessLevel from "@/Components/Hooks/useAccessLevel";
import List from "../UI/List";
import PageMetaEditor from "../PageMeta/PageMetaEditor";
import { ta } from "@/Components/Admin/i18n/adminText";

const AdminManageSpecialityPage = () => {
  const params = useParams<{ nodeId: string }>();
  const { data, error, mutate } = useSWR<ISpeciality>(
    params ? `${API}/auto/speciality/${params.nodeId}` : null,
    (url: string) => fetcher({ url }).then((res) => res.data.data),
  );

  const { setPopup } = usePopup();

  const push = useProgress();

  const hasAccess = useAccessLevel();

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle title={data.name || ta("تخصص")}>
          <TabSystem
            name="AdminManageSpeciality"
            items={[
              {
                title: ta("جزئیات"),
                id: "Info",
                content: (
                  <CreateForm
                    readOnly={!hasAccess("Sepciality", "update")}
                    defaultValue={data}
                    renderer={{
                      name: { type: "text", title: ta("نام") },
                      slug: { type: "text", title: ta("اسلاگ") },
                      summary: { type: "text", title: ta("خلاصه") },
                      image: { type: "image", title: ta("تصویر") },
                      order: { type: "number", title: ta("رتبه") },
                      isHome: { type: "bool", title: ta("نمایش در خانه") },
                      active: { type: "bool", title: ta("فعال") },
                      description: { type: "rtf", title: ta("توضیحات") },
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
                title: ta("متادیتا"),
                id: "Meta",
                icon: <InfoIcon />,
                content: (
                  <PageMetaEditor
                    resourceType="/speciality/[slug]"
                    slug={data.slug}
                  />
                ),
              },
              {
                title: ta("عملیات"),
                id: "Actions",
                icon: <InfoIcon />,
                content: (
                  <List>
                    {hasAccess("Sepciality", "delete") && (
                      <Button
                        variant="Error"
                        onClick={() =>
                          setPopup(
                            "DeleteSpeciality",
                            <DeleteSpecialityPopup
                              node={data}
                              mutate={() => push(adminPath("/speciality"))}
                            />,
                          )
                        }
                      >
                        {ta("حذف")}
                      </Button>
                    )}
                  </List>
                ),
              },
              {
                id: "translations",
                title: ta("ترجمه‌ها"),
                content: <AdminContentTranslationPage segment="speciality" />,
              },
            ]}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminManageSpecialityPage;
