import { useRef } from "react";
import useSWR from "swr";
import useUser from "../Hooks/useUser";
import usePopup from "../Hooks/usePopup";
import AuthPopup from "../Popups/AuthPopup";
import { fetcher } from "../helpers/fetcher";
import { ContentKey } from "../Enums/contentKeys";
import { ReviewBasisKind, VerifiedBadge } from "./ReviewBits";
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
// submit. Open Q&A pages (blog...) take text only, no stars.
const SubmitCommentForm = ({
  model,
  nodeId,
  rated = true,
  basis = null,
}: {
  model: CommentableDocumentPath;
  nodeId: string;
  rated?: boolean;
  basis?: ReviewBasisKind | null;
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
    rated && user ? `${API}/comment/${model}/${nodeId}/eligibility` : null,
    (url: string) => fetcher({ url }).then((res) => res?.data ?? null),
  );

  const areaRef = useRef<HTMLTextAreaElement>(null);

  const { input, isLoading, setInput, submit, reset } = useForm<{
    content: string;
    score: number;
  }>({
    path: `${API}/comment/${model}/${nodeId}`,
    method: "POST",
    hasProblem: (inp) =>
      !inp.content?.trim() || (rated && !inp.score)
        ? getContent("checkInput")
        : false,
    successCb: () => {
      reset();
      if (areaRef.current) areaRef.current.value = "";
      if (rated) recheck();
    },
  });

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
            {getContent("reviewLoginButton" as ContentKey)}
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
          {getContent("submitYourComment")}
        </legend>
        <p className={`${classes.closed} ${tsmRegular}`}>
          {getContent(
            (closedKey[eligibility.reason || (basis === "purchase" ? "noPurchase" : "noVisit")] ||
              "reviewClosedNoVisit") as ContentKey,
          )}
        </p>
        {(eligibility.basis ?? basis) === "visit" &&
          eligibility.reason !== "alreadyReviewed" && (
            <a className={`${classes.bookLink} ${tsmMedium}`} href="#doctors">
              {getContent("reviewBookVisitLink" as ContentKey)}
            </a>
          )}
      </div>
    );

  return (
    <div className={classes.form}>
      <legend className={`${classes.formTitle} ${tsmMedium}`}>
        {rated
          ? getContent("submitYourComment")
          : getContent("submitYourQuestion" as ContentKey)}
      </legend>
      {rated && eligibility?.eligible && (
        <p className={`${classes.verifiedHint} ${tsmRegular}`}>
          <VerifiedBadge kind={eligibility.basis} at={eligibility.at} />
          {getContent("reviewWillBeVerified" as ContentKey)}
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
            onClick={() => setInput((prev) => ({ ...prev, score }))}
          >
            <Ixon width="1.5rem">
              <StarIcon />
            </Ixon>
          </button>
        ))}
      </div>
      )}
      <textarea
        onChange={(e) =>
          setInput((prev) => ({ ...prev, content: e.target.value }))
        }
        placeholder={getContent("shareYourCommentPlaceholder")}
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
