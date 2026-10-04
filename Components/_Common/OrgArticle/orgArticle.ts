import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { MongoDoc } from "@/Components/Hooks/useUser";
import { ContentKey } from "@/Components/Enums/contentKeys";

// One article manager for every organisation panel (clinic, hospital,
// pharmacy, paraclinic, insurance): same backend (/blog/<kind>), same
// moderation; only the panel path and the text namespace differ.

export type OrgArticleKind = "clinic" | "hospital" | "pharmacy" | "paraClinic" | "insurance";

export const orgArticleConfig: Record<OrgArticleKind, { panel: string; ns: ContentNamespace[] }> = {
  clinic: { panel: "/clinicpanel", ns: ["common", "clinicPanelArticle"] },
  hospital: { panel: "/hospitalpanel", ns: ["common", "hospitalPanelArticle"] },
  pharmacy: { panel: "/pharmacypanel", ns: ["common", "pharmacyPanelArticle"] },
  paraClinic: { panel: "/paraClinicPanel", ns: ["common", "paraClinicPanelArticle"] },
  insurance: { panel: "/insurancepanel", ns: ["common", "insurancePanelArticle"] },
};

export interface IArticleCategory extends MongoDoc {
  title?: string;
}

export interface IArticle extends MongoDoc {
  title?: string;
  summary?: string;
  image?: string;
  content?: string;
  readTime?: string;
  slug?: string;
  published: boolean;
  // the admin's review: a rejected post carries the reason
  reviewStatus?: "pending" | "approved" | "rejected";
  rejectReason?: string;
  category?: IArticleCategory | string;
  createdAt?: string;
}

// published / rejected / waiting for the admin's review (every panel's
// article list, the doctor's too)
export const articleStatusOf = (
  node: { published?: boolean; reviewStatus?: string },
  getContent: (key: ContentKey, vars?: string[]) => string,
) =>
  node.published
    ? getContent("articlePublished")
    : node.reviewStatus === "rejected"
      ? getContent("articleRejected")
      : getContent("articlePendingReview");
