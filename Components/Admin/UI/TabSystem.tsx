import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./TabSystem.module.css";
import Ixon from "@/Components/UI/Ixon";

export type TabSystemTab = {
  title: ReactNode;
  id: string;
  content: ReactNode;
  icon?: ReactNode;
};

const TabSystem = ({
  items,
  name,
}: {
  items: TabSystemTab[];
  name?: string;
}) => {
  const [currentTab, setCurrenTab] = useState<string>(
    name
      ? items.find((el) => el.id === localStorage.getItem(name))?.id ||
          items[0]?.id
      : items[0]?.id,
  );

  const currentContent = useMemo<ReactNode>(
    () => items.find((tab) => tab.id === currentTab)?.content || null,
    [currentTab, items],
  );

  useEffect(() => {
    if (!name) return;
    localStorage.setItem(name, currentTab);
  }, [currentTab, name]);

  return (
    <div className={classes.main}>
      <div className={classes.nav} role="tablist">
        {items.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={currentTab === tab.id}
            onClick={() => setCurrenTab(tab.id)}
            className={`${classes.button} ${
              currentTab === tab.id ? classes.active : ""
            }`}
          >
            {!!tab.icon && <Ixon width="1.125rem">{tab.icon}</Ixon>}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>
      <div className={classes.content} key={currentTab}>
        {currentContent}
      </div>
    </div>
  );
};

export default TabSystem;
