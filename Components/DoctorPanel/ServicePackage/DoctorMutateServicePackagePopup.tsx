import PopupCard from "@/Components/UI/PopupCard";
import { IServicePackage } from "./DoctorManageServicePackagesPage";
import classes from "./DoctorMutateServicePackagePopup.module.css";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { IServiceCategory } from "@/Components/Admin/ServiceCategory/AdminManageServiceCategoriesPage";
import { IService } from "../Service/DoctorManageServicesPage";

const DoctorMutateServicePackagePopup = ({
  mutate,
}: {
  mutate: () => unknown;
}) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IServicePackage>
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
          services: {
            type: "nodes",
            title: getContent("services"),
            path: `${API}/doctor/service`,
            multi: true,
            getOptionLabel: (node) =>
              (node as IService).name || (node as IService)._id,
            getOptionValue: (node) => (node as IService)._id,
          },
          price: { title: getContent("price"), type: "number", price: true },
          discount: {
            title: getContent("discount"),
            type: "number",
            price: true,
          },
          order: { title: getContent("order"), type: "number" },
          isActive: { title: getContent("isActive"), type: "bool" },
          image: { title: getContent("image"), type: "image" },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/doctor/servicepackage`,
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

export default DoctorMutateServicePackagePopup;
