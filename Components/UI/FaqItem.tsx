import { useState } from "react";
import { IDoctorFaq } from "../DoctorPanel/Profile/DoctorManageFaqTab";
import classes from "./FaqItem.module.css";
import Ixon from "./Ixon";
import HelpCircleIcon from "../Icons/HelpCircleIcon";
import ChevronIcon from "../Icons/ChevronIcon";

const FaqItem = ({ node }: { node: IDoctorFaq }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <dl className={classes.main}>
      <dt className={classes.question}>
        <Ixon width="1.5rem">
          <HelpCircleIcon />
        </Ixon>
        <span>{node.question}</span>
        <button
          type="button"
          className={classes.btn}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          <Ixon
            width="1.5rem"
            className={classes.chevron}
            style={{ transform: `rotateZ(${isOpen ? "90deg" : "0"})` }}
          >
            <ChevronIcon />
          </Ixon>
        </button>
      </dt>
      <dd
        className={classes.answer}
        style={{
          maxHeight: isOpen ? "10rem" : 0,
          paddingBlock: isOpen ? "1rem" : "0",
        }}
      >
        {node.answer}
      </dd>
    </dl>
  );
};

export default FaqItem;
