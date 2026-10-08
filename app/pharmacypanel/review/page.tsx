import OrgReviewsPage from "@/Components/_Common/OrgReviews/OrgReviewsPage";
import LocaleScopeProvider from "@/Components/Store/LocaleScopeProvider";
import { getScopedTextContent } from "@/Components/helpers/getScopedTextContent";

// buyers' published reviews of this pharmacy and its one public reply each (2026-10)
const Reviews = async () => {
  const textContent = await getScopedTextContent(["orgReviews"]);
  return (
    <LocaleScopeProvider namespaces={["orgReviews"]} initialTextContent={textContent}>
      <OrgReviewsPage kind="pharmacy" panel="pharmacypanel" />
    </LocaleScopeProvider>
  );
};

export default Reviews;
