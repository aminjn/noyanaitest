import PopupCard from "@/Components/UI/PopupCard";
import { IArticle, IArticleCategory } from "./ClinicManageArticlesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useLocale from "@/Components/Hooks/useLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const ClinicMutateArticlePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useLocale();

  const { closePopup } = usePopup();

  return (
    <PopupCard>
      <CreateForm<IArticle>
        renderer={{
          title: { type: "text", title: getContent("title") },
          summary: { type: "area", title: getContent("summary") },
          image: { type: "image", title: getContent("image") },
          readTime: { type: "text", title: getContent("readTime") },
          category: {
            type: "nodes",
            title: getContent("category"),
            path: `${API}/blog/clinic/category`,
            multi: false,
            clearable: true,
            getOptionLabel: (node) =>
              (node as IArticleCategory).title || (node as IArticleCategory)._id,
            getOptionValue: (node) => (node as IArticleCategory)._id,
          },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/blog/clinic`,
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

export default ClinicMutateArticlePopup;
