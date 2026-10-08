import useSWR from "swr";
import { Population } from "../Admin/Clinic/AdminManageClinicsPage";
import useUser, { IUser, MongoDoc, UserPopulation } from "../Hooks/useUser";
import classes from "./CommentSection.module.css";
import { API, FilePath } from "../config";
import { fetcher } from "../helpers/fetcher";
import HandleLoading from "../Admin/UI/HandleLoading";
import { useState } from "react";
import useForm from "../Hooks/useForm";
import Ixon from "../UI/Ixon";
import StarIcon from "../Icons/StarIcon";
import SubmitCommentForm from "./SubmitCommentForm";
import { IBlog } from "../Admin/Blog/AdminManageBlogsPage";
import {
  IDisease,
  IDrug,
  ISymptom,
} from "../Admin/Disease/AdminManageDiseasesPage";
import { IProduct } from "../Admin/Product/AdminManageProductsPage";
import CommentIcon from "../Icons/CommentIcon";
import StarsSolidIcon from "../Icons/StarsSolidIcon";
import CommentsSummary from "./CommentsSummary";
import { tbaseBold, tbaseMedium, tsmBold, tsmRegular } from "../UI/Typography";
import Button from "../UI/Button";
import { ContentKey } from "../Enums/contentKeys";
import Image from "next/image";
import { getRelativeTime } from "../helpers/lib";
import HandThumUpIcon from "../Icons/HandThumbUpIcon";
import HandThumbUpLineIcon from "../Icons/HandThumbUpLineIcon";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import Act from "../UI/Act";
import Pagination from "../UI/Pagination";
import { usePathname } from "@/Components/i18n/navigation";
import HostedImage from "../UI/HostedImage";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import { ta } from "@/Components/Admin/i18n/adminText";
import {
  ProviderReply,
  ReviewBasisKind,
  ReviewReply,
  ReviewTagChips,
  VerifiedBadge,
} from "./ReviewBits";

const LOCALE_NS: ContentNamespace[] = ["common", "commentSection"];

export const commentableDocumentPaths = [
  "Blog",
  "Disease",
  "Symptom",
  "Drug",
  "Comment",
  "Product",
  "Clinic",
  "ProductPackage",
  "Service",
  "ServicePackage",
  "ParaClinic",
  "Hospital",
  "Insurance",
  "DoctorProfile",
  // a pharmacy rated as a seller by its buyers (2026-10)
  "Pharmacy",
] as const;

export type CommentableDocumentPath = (typeof commentableDocumentPaths)[number];

export const commentDocumentsDict: Record<CommentableDocumentPath, string> = {
  get Blog() {
  return ta("وبلاگ");
},
  get Comment() {
  return ta("کامنت");
},
  get Disease() {
  return ta("بیماری");
},
  get Drug() {
  return ta("دارو");
},
  get Product() {
  return ta("محصول");
},
  get Symptom() {
  return ta("علامت");
},
  get Clinic() {
  return ta("کلینیک");
},
  get ProductPackage() {
  return ta("پکیج  محصول");
},
  get Service() {
  return ta("سرویس");
},
  get ServicePackage() {
  return ta("پکیج سرویس");
},
  get ParaClinic() {
  return ta("پاراکلینیک");
},
  get Hospital() {
  return ta("بیمارستان");
},
  get Insurance() {
  return ta("بیمه");
},
  get DoctorProfile() {
  return ta("پزشک");
},
  get Pharmacy() {
  return ta("داروخانه");
},
};

const commentStatuses = ["Pending", "Approved", "Rejected"] as const;

type CommentStatus = (typeof commentStatuses)[number];

export const commentStatusDict: Record<CommentStatus, string> = {
  get Approved() {
  return ta("تایید شده");
},
  get Pending() {
  return ta("منتظر");
},
  get Rejected() {
  return ta("رد شده");
},
};

export type CommentPopulation = Population<{
  Author: UserPopulation;
  Votes: UserPopulation;
  resource: Population<Record<never, never>>;
}>;

export const scores = [1, 2, 3, 4, 5] as const;

export type Score = (typeof scores)[number];

export interface IComment<
  T extends CommentPopulation = CommentPopulation,
> extends MongoDoc {
  author: T["Author"] extends UserPopulation ? IUser<T["Author"]> : string;
  resource: T["resource"] extends Population<Record<never, never>>
    ? IBlog | IDisease | ISymptom | IDrug | IComment | IProduct
    : string;
  refPath: CommentableDocumentPath;
  content: string;
  score: Score;
  upvotes: T["Votes"] extends UserPopulation ? IUser<T["Votes"]>[] : string[];
  status: CommentStatus;
  createdAt: Date;
  // verified review (2026-10): backed by a completed visit / delivered
  // order; only these feed a rated page's score
  verified?: boolean;
  verifiedKind?: ReviewBasisKind;
  verifiedAt?: string;
  reply?: ReviewReply;
  // quick tags of a seller review (pharmacy / lab)
  tags?: string[];
}

const filters = [5, 4, 3, "low"] as const;

type Filter = (typeof filters)[number];
const filterContentKeyDict: Record<Filter, ContentKey> = {
  "3": "3Star",
  "4": "4Star",
  "5": "5Star",
  low: "lowStar",
};

const CommentItem = ({
  node,
  mutate,
  rated,
}: {
  node: IComment<{ Author: Record<never, never> }>;
  mutate: () => unknown;
  rated: boolean;
}) => {
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getContent = useScopedLocale(LOCALE_NS);

  const { setPopup } = usePopup();

  return (
    <div className={classes.item}>
      <div className={classes.itemHeader}>
        <div className={classes.itemImage}>
          <HostedImage
            alt={node.author?.username || ""}
            src={node.author?.avatar}
            sizes="2.5rem"
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className={classes.itemContent}>
          <div className={`${classes.itemName} ${tbaseBold}`}>
            {node.author?.username || getContent("user")}
          </div>
          <div className={`${classes.itemDate} ${tsmRegular}`}>
            {getRelativeTime(node.createdAt)}
          </div>
        </div>
        {rated && !!node.score && (
          <div className={classes.itemScore}>
            {scores.map((score) => (
              <Ixon
                width=".875rem"
                key={score}
                className={node.score >= score ? classes.activeScore : ""}
              >
                <StarIcon />
              </Ixon>
            ))}
          </div>
        )}
      </div>
      {node.verified && (
        <div className={classes.itemBadge}>
          <VerifiedBadge kind={node.verifiedKind} at={node.verifiedAt} />
        </div>
      )}
      {rated && <ReviewTagChips tags={node.tags} />}
      {!!node.content && <p className={classes.itemMessage}>{node.content}</p>}
      <ProviderReply reply={node.reply} />
      <div className={classes.itemFooter}>
        <Button
          className={classes.upVote}
          variant="Neutral"
          mode="Inline"
          leadIcon={
            <Ixon
              className={
                !!user && Array.isArray(node.upvotes) && node.upvotes.includes(user._id)
                  ? classes.upvoted
                  : ""
              }
            >
              <HandThumbUpLineIcon />
            </Ixon>
          }
          size="S"
          onClick={() => {
            if (!user) return setPopup("auth", <AuthPopup />);
            setIsLoading(true);
          }}
          isLoading={isLoading}
        >
          {`${getContent("wasUseful")} (${Array.isArray(node.upvotes) ? node.upvotes.length : 0})`}
        </Button>
      </div>
      <Act
        path={isLoading ? `${API}/comment/${node._id}` : null}
        method="POST"
        onDone={(status) => {
          setIsLoading(false);
          if (!status) return;
          mutate();
        }}
      />
    </div>
  );
};

const CommentSection = ({
  model,
  nodeId,
}: {
  model: CommentableDocumentPath;
  nodeId: string;
}) => {
  const [page, setPage] = useState<number>(1);

  const [filter, setFilter] = useState<null | Filter>(null);

  const pathname = usePathname();

  const { data, error, mutate } = useSWR<{
    data: IComment<{ Author: Record<never, never> }>[];
    average: number;
    count: number;
    scores: Record<Score, number>;
    pagesCount: number;
    // does this page take star ratings, and what proves a reviewer
    rated?: boolean;
    basis?: ReviewBasisKind | null;
    // seller reviews: the quick tags offered and how often each was ticked
    tagOptions?: string[];
    tags?: Record<string, number>;
  }>(
    `${API}/comment/${model}/${nodeId}?page=${page}${filter ? `&star=${filter}` : ""}`,
    (url: string) => fetcher({ url }).then((res) => res.data),
  );

  const getContent = useScopedLocale(LOCALE_NS);

  // older API responses carry no flag: they were all rated
  const rated = data?.rated !== false;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <div className={classes.main}>
          <div className={classes.titleBox}>
            <Ixon width="1rem" className={classes.icon}>
              <CommentIcon />
            </Ixon>
            <legend className={`${classes.title} ${tbaseMedium}`}>
              {`${getContent(rated ? "useComments" : ("questionsAndComments"))} (${getContent("xComments", [String(data.count || 0)])})`}
            </legend>
          </div>
          {rated && (
            <CommentsSummary
              average={data.average || 0}
              count={data.count || 0}
              scores={data.scores || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }}
            />
          )}
          {rated && !!data.tags && Object.values(data.tags).some((n) => Number(n) > 0) && (
            <div className={classes.tagSummary}>
              <span className={`${classes.tagSummaryTitle} ${tsmRegular}`}>
                {getContent("reviewTagsSummaryTitle")}
              </span>
              <ReviewTagChips tags={data.tagOptions} counts={data.tags} />
            </div>
          )}
          <SubmitCommentForm
            model={model}
            nodeId={nodeId}
            rated={rated}
            basis={data.basis ?? null}
          />
          {rated && (
          <div className={classes.filterBox}>
            <Button
              variant={!!filter ? "Disable" : "Primary"}
              mode="Fill"
              size="S"
              radius="High"
              onClick={() => setFilter(null)}
            >
              {getContent("all")}
            </Button>
            {filters.map((f) => (
              <Button
                variant={filter === f ? "Primary" : "Disable"}
                mode="Fill"
                size="S"
                radius="High"
                key={f}
                onClick={() => setFilter(f)}
              >
                {getContent(filterContentKeyDict[f])}
              </Button>
            ))}
          </div>
          )}
          <div className={classes.comments}>
            {(Array.isArray(data.data) ? data.data : []).map((comment) => (
              <CommentItem
                key={comment._id}
                node={comment}
                mutate={mutate}
                rated={rated}
              />
            ))}
          </div>
          <Pagination
            className={classes.pagination}
            currentPage={page}
            makePath={() => pathname}
            pagesCount={data.pagesCount}
            onClickPage={setPage}
          />
        </div>
      )}
    </HandleLoading>
  );
};

export default CommentSection;
