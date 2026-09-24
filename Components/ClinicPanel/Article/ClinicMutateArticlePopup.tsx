import PopupCard from "@/Components/UI/PopupCard";
import { IArticle, IArticleCategory } from "./ClinicManageArticlesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "clinicPanelArticle"];

const ClinicMutateArticlePopup = ({ mutate }: { mutate: () => unknown }) => {
  const getContent = useScopedLocale(NS);

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
