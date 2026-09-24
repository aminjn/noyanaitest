import PopupCard from "@/Components/UI/PopupCard";
import { IArticle, IArticleCategory } from "./PharmacyManageArticlesPage";
import CreateForm from "@/Components/Admin/UI/CreateForm";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import { API } from "@/Components/config";

const NS: ContentNamespace[] = ["common", "pharmacyPanelArticle"];

const PharmacyMutateArticlePopup = ({ mutate }: { mutate: () => unknown }) => {
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
            path: `${API}/blog/pharmacy/category`,
            multi: false,
            clearable: true,
            getOptionLabel: (node) =>
              (node as IArticleCategory).title || (node as IArticleCategory)._id,
            getOptionValue: (node) => (node as IArticleCategory)._id,
          },
        }}
        hookProps={{
          method: "POST",
          path: `${API}/blog/pharmacy`,
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

export default PharmacyMutateArticlePopup;
