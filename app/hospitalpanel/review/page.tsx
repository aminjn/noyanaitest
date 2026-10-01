import OrgReviewsPage from "@/Components/_Common/OrgReviews/OrgReviewsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

const Reviews = async () => {
  const textContent = await getScopedTextContent(["orgReviews"]);
  return (
    <LocaleScopeProvider namespaces={["orgReviews"]} initialTextContent={textContent}>
      <OrgReviewsPage kind="hospital" panel="hospitalpanel" />
    </LocaleScopeProvider>
  );
};

export default Reviews;
