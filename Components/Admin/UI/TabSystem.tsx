import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./TabSystem.module.css";
import Ixon from "@/Components/UI/Ixon";

const TabSystem = ({
  items,
  name,
}: {
  items: { title: string; id: string; content: ReactNode; icon: ReactNode }[];
  name: string;
}) => {
  const [currentTab, setCurrenTab] = useState<string>(
    items.find((el) => el.id === localStorage.getItem(name))?.id || items[0]?.id
  );

  const currentContent = useMemo<ReactNode>(
    () => items.find((tab) => tab.id === currentTab)?.content || null,
    [currentTab, items]
  );

  useEffect(() => {
    localStorage.setItem(name, currentTab);
  }, [currentTab, name]);

  return (
    <div className={classes.main}>
      <div
        className={classes.nav}
        style={{
          animationDuration: `calc(var(--transTime) * ${items.length})`,
        }}
      >
        {items.map((tab, i) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrenTab(tab.id)}
            className={`${classes.button} ${
              currentTab === tab.id ? classes.active : ""
            }`}
            style={{ animationDelay: `calc(${i} * var(--transTime))` }}
          >
            <Ixon width="2rem">{tab.icon}</Ixon>
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
