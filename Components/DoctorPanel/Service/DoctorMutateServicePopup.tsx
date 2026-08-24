import PopupCard from "@/Components/UI/PopupCard";
import { IService } from "./DoctorManageServicesPage";
import classes from "./DoctorMutateServicePopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { IServiceCategory } from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";

const DoctorMutateServicePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IService>
        renderer={{
          name: { type: "text", title: getContent("name") },
          category: {
            type: "nodes",
            title: getContent("category"),
            path: `${API}/public/selectservicecategory`,
            multi: false,
            clearable: true,
            getOptionLabel: (node) =>
              (node as IServiceCategory).title ||
              (node as IServiceCategory)._id,
            getOptionValue: (node) => (node as IServiceCategory)._id,
          },
          price: { title: getContent("price"), type: "number", price: true },
          discount: {
            title: getContent("discount"),
            type: "number",
            price: true,
          },
          inventory: { title: getContent("inventory"), type: "number" },
          order: { title: getContent("order"), type: "number" },
          isActive: { title: getContent("isActive"), type: "bool" },
          isHome: { title: getContent("isHome"), type: "bool" },
          special: { title: getContent("special"), type: "bool" },
          image: { title: getContent("image"), type: "image" },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/doctor/service`,
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
        onCancel={() => closePopup()}
      />
    </PopupCard>
  );
};

export default DoctorMutateServicePopup;
