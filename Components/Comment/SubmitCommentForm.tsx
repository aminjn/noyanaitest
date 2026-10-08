import { useRef } from "react";
import useSWR from "swr";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import { fetcher } from "../helpers/fetcher";
import { ContentKey } from "../Enums/contentKeys";
import { ReviewBasisKind, ReviewTagChips, VerifiedBadge } from "./ReviewBits";
import { knownReviewTags, NEGATIVE_TAG_MAX_SCORE, negativeReviewTags } from "./reviewTags";
import { API } from "../config";
import useForm from "../Hooks/useForm";
import StarIcon from "../Icons/StarIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { tsmMedium, tsmRegular } from "../UI/Typography";
import { CommentableDocumentPath, scores } from "./CommentSection";
import classes from "./SubmitCommentForm.module.css";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const LOCALE_NS: ContentNamespace[] = ["common", "commentSection"];

type Eligibility = {
  rated: boolean;
  basis: ReviewBasisKind | null;
  eligible: boolean;
  reason: "noVisit" | "noPurchase" | "alreadyReviewed" | "doctorVisit" | null;
  at?: string | null;
  // the quick tags this page offers (seller reviews of a pharmacy / lab)
  tagOptions?: string[];
  // offered instead at a score <= negativeTagMaxScore (private feedback)
  negativeTagOptions?: string[];
  negativeTagMaxScore?: number;
};

const closedKey: Record<NonNullable<Eligibility["reason"]>, string> = {
  noVisit: "reviewClosedNoVisit",
  noPurchase: "reviewClosedNoPurchase",
  alreadyReviewed: "reviewClosedAlready",
  doctorVisit: "reviewClosedNoVisit",
};

// Verified reviews (2026-10, Zocdoc / Doctolib / Digikala): on a rated page
// (centre, product, service) the stars and text are open only to someone
// with a completed visit / delivered order there, one review each; the
// form says why it is closed and points to booking instead of failing on
// submit. Open Q&A pages (blog...) take text only, no stars. On a rated
// page the stars are the review: the text is optional. A pharmacy / lab
// (seller review, 2026-10) also offers quick tags and can be tied to one
// order (`order`, from the order page).
const SubmitCommentForm = ({
  model,
  nodeId,
  rated = true,
  basis = null,
  order,
  title,
  onSubmitted,
}: {
  model: CommentableDocumentPath;
  nodeId: string;
  rated?: boolean;
  basis?: ReviewBasisKind | null;
  order?: string;
  // replaces the form's own legend (the order page names the seller)
  title?: string;
  onSubmitted?: () => unknown;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const { user } = useUser();
  const { setPopup } = usePopup();

  const {
    data: eligibility,
    error: eligibilityError,
    isLoading: checking,
    mutate: recheck,
  } = useSWR<Eligibility | null>(
    rated && user
      ? `${API}/comment/${model}/${nodeId}/eligibility${order ? `?order=${order}` : ""}`
      : null,
    (url: string) => fetcher({ url }).then((res) => res?.data ?? null),
  );

  const areaRef = useRef<HTMLTextAreaElement>(null);

  const negativeMax =
    typeof eligibility?.negativeTagMaxScore === "number"
      ? eligibility.negativeTagMaxScore
      : NEGATIVE_TAG_MAX_SCORE;

  const { input, isLoading, setInput, submit, reset } = useForm<{
    content: string;
    score: number;
    tags: string[];
  }>({
    path: `${API}/comment/${model}/${nodeId}`,
    method: "POST",
    parser: "JSON",
    hasProblem: (inp) =>
      rated ? (!inp.score ? getContent("checkInput") : false) : !inp.content?.trim() ? getContent("checkInput") : false,
    mutator: (inp) => ({
      content: inp.content?.trim() || "",
      ...(rated && inp.score ? { score: inp.score } : {}),
      ...(rated && inp.tags?.length ? { tags: inp.tags } : {}),
      ...(rated && order ? { order } : {}),
    }),
    successCb: () => {
      reset();
      if (areaRef.current) areaRef.current.value = "";
      if (rated) recheck();
      onSubmitted?.();
    },
  });

  // the tags follow the score: what went well, or at a low score what
  // went wrong (the server checks the same and keeps those private)
  const negative = !!input.score && input.score <= negativeMax;
  const tagOptions = knownReviewTags(
    negative ? eligibility?.negativeTagOptions : eligibility?.tagOptions,
  );

  if (rated && !user)
    return (
      <div className={classes.form}>
        <p className={`${classes.closed} ${tsmRegular}`}>
          {getContent(
            (basis === "purchase" ? "reviewClosedNoPurchase" : "reviewClosedNoVisit") as ContentKey,
          )}
        </p>
        <div className={classes.action}>
          <Button
            size="M"
            variant="Primary"
            radius="High"
            mode="Outline"
            onClick={() => setPopup("auth", <AuthPopup />)}
          >
            {getContent("reviewLoginButton")}
          </Button>
        </div>
      </div>
    );

  // on a failed check the form stays open (the server still enforces it)
  if (rated && (checking || (eligibility === undefined && !eligibilityError)))
    return null;

  if (rated && eligibility && !eligibility.eligible)
    return (
      <div className={classes.form}>
        <legend className={`${classes.formTitle} ${tsmMedium}`}>
          {title || getContent("submitYourComment")}
        </legend>
        <p className={`${classes.closed} ${tsmRegular}`}>
          {getContent(
            (order && eligibility.reason === "alreadyReviewed"
              ? "reviewDoneForOrder"
              : closedKey[eligibility.reason || (basis === "purchase" ? "noPurchase" : "noVisit")] ||
                "reviewClosedNoVisit") as ContentKey,
          )}
        </p>
        {(eligibility.basis ?? basis) === "visit" &&
          eligibility.reason !== "alreadyReviewed" && (
            <a className={`${classes.bookLink} ${tsmMedium}`} href="#doctors">
              {getContent("reviewBookVisitLink")}
            </a>
          )}
      </div>
    );

  return (
    <div className={classes.form}>
      <legend className={`${classes.formTitle} ${tsmMedium}`}>
        {title ||
          (rated
            ? getContent("submitYourComment")
            : getContent("submitYourQuestion"))}
      </legend>
      {rated && eligibility?.eligible && (
        <p className={`${classes.verifiedHint} ${tsmRegular}`}>
          <VerifiedBadge kind={eligibility.basis} at={eligibility.at} />
          {getContent("reviewWillBeVerified")}
        </p>
      )}
      {rated && (
      <div className={classes.scoreBox}>
        {scores.map((score) => (
          <button
            className={`${classes.score} ${score <= (input.score || 0) ? classes.activeScore : ""}`}
            key={score}
            type="button"
            aria-label={String(score)}
            onClick={() =>
              setInput((prev) => {
                // switching between a low and a good score drops the tags
                // of the other kind
                const low = score <= negativeMax;
                const tags = (prev.tags || []).filter((t) => negativeReviewTags.has(t) === low);
                return { ...prev, score, tags };
              })
            }
          >
            <Ixon width="1.5rem">
              <StarIcon />
            </Ixon>
          </button>
        ))}
      </div>
      )}
      {rated && !!tagOptions.length && (
        <>
          <span className={`${classes.closed} ${tsmRegular}`}>
            {getContent(negative ? "reviewTagsPromptNegative" : "reviewTagsPrompt")}
          </span>
          <ReviewTagChips
            tags={tagOptions}
            selected={input.tags || []}
            onToggle={(tag) =>
              setInput((prev) => {
                const current = prev.tags || [];
                return {
                  ...prev,
                  tags: current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag],
                };
              })
            }
          />
          {negative && (
            <span className={`${classes.closed} ${tsmRegular}`}>{getContent("reviewTagsNegativePrivate")}</span>
          )}
        </>
      )}
      <textarea
        onChange={(e) =>
          setInput((prev) => ({ ...prev, content: e.target.value }))
        }
        placeholder={getContent(rated ? "reviewTextOptional" : "shareYourCommentPlaceholder")}
        className={`${classes.area} ${tsmRegular}`}
        ref={areaRef}
      />
      <div className={classes.action}>
        <Button
          size="M"
          variant="Primary"
          radius="High"
          mode="Fill"
          onClick={submit}
          isLoading={isLoading}
        >
          {getContent("submitComment")}
        </Button>
      </div>
    </div>
  );
};

export default SubmitCommentForm;
