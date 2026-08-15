import { useState } from "react";
import { IFaq } from "../Admin/Faq/AdminManageFaqsPage";
import classes from "./HomeFaqs.module.css";
import Ixon from "../UI/Ixon";
import ChevronDownSquareIcon from "../Icons/ChevronDownSquareIcon";
import { tsmMedium, tsmRegular } from "../UI/Typography";

export const FaqItem = ({ node }: { node: IFaq }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <li>
      <dl className={classes.faq}>
        <dt className={classes.questionBox}>
          <span className={`${classes.question} ${tsmMedium}`}>
            {node.question}
          </span>
          <button onClick={() => setIsOpen((prev) => !prev)}>
            <Ixon width="1.5rem" className={classes.chevron}>
              <ChevronDownSquareIcon />
            </Ixon>
          </button>
        </dt>
        <dd
          className={`${classes.answer} ${isOpen ? classes.open : ""} ${tsmRegular}`}
        >
          {node.answer}
        </dd>
      </dl>
    </li>
  );
};

const HomeFaqs = ({ nodes }: { nodes?: IFaq[] }) => {
  if (!nodes?.length) return null;
  return (
    <ul className={classes.main}>
      {nodes.map((node) => (
        <FaqItem node={node} key={node._id} />
      ))}
    </ul>
  );
};

export default HomeFaqs;
