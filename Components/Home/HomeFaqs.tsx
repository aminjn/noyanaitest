import { useState } from "react";
import { IFaq } from "../Admin/Faq/AdminManageFaqsPage";
import SectionHeader from "../UI/SectionHeader";
import classes from "./HomeFaqs.module.css";
import Ixon from "../UI/Ixon";
import ChevronDownSquareIcon from "../Icons/ChevronDownSquareIcon";
import { tsmMedium, tsmRegular, } from "../UI/Typography";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";

const NS: ContentNamespace[] = ["common", "homeFaqs"];

export const FaqItem = ({ node }: { node: IFaq }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <li>
      <dl className={classes.faq}>
        <dt
          className={classes.questionBox}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <span className={`${classes.question} ${tsmMedium}`}>
            {node.question}
          </span>
          <button>
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
  const getContent = useScopedLocale(NS);

  if (!nodes?.length) return null;
  return (
    <div className={classes.container}>
      <SectionHeader
        title={getContent("frequentlyAskedQuestions")}
        action={{ href: "/faq", label: getContent("seeAll") }}
      />
      <ul className={classes.main}>
        {nodes.map((node) => (
          <FaqItem node={node} key={node._id} />
        ))}
      </ul>
    </div>
  );
};

export default HomeFaqs;
