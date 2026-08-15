import { useRef } from "react";
import { API } from "../config";
import useForm from "../Hooks/useForm";
import useLocale from "../Hooks/useLocale";
import StarIcon from "../Icons/StarIcon";
import Button from "../UI/Button";
import Ixon from "../UI/Ixon";
import { tsmMedium, tsmRegular } from "../UI/Typography";
import { CommentableDocumentPath, scores } from "./CommentSection";
import classes from "./SubmitCommentForm.module.css";
const SubmitCommentForm = ({
  model,
  nodeId,
}: {
  model: CommentableDocumentPath;
  nodeId: string;
}) => {
  const getContent = useLocale();

  const areaRef = useRef<HTMLTextAreaElement>(null);

  const { input, isLoading, setInput, submit, reset } = useForm<{
    content: string;
    score: number;
  }>({
    path: `${API}/comment/${model}/${nodeId}`,
    method: "POST",
    hasProblem: (inp) =>
      !inp.content || !inp.score ? getContent("checkInput") : false,
    successCb: () => {
      reset();
      if (areaRef.current) areaRef.current.value = "";
    },
  });

  return (
    <div className={classes.form}>
      <legend className={`${classes.formTitle} ${tsmMedium}`}>
        {getContent("submitYourComment")}
      </legend>
      <div className={classes.scoreBox}>
        {scores.map((score) => (
          <button
            className={`${classes.score} ${score <= (input.score || 0) ? classes.activeScore : ""}`}
            key={score}
            onClick={() => setInput((prev) => ({ ...prev, score }))}
          >
            <Ixon width="1.5rem">
              <StarIcon />
            </Ixon>
          </button>
        ))}
      </div>
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
