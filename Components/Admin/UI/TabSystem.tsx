import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./TabSystem.module.css";
import Ixon from "@/Components/UI/Ixon";

export type TabSystemTab = {
  title: ReactNode;
  id: string;
  content: ReactNode;
  icon?: ReactNode;
};

const readSaved = (name?: string) => {
  if (!name) return null;
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
};

// `viewState` lets the parent drive the open tab (e.g. an overview that
// jumps to a tab); otherwise the tab is local and, with `name`, remembered
const TabSystem = ({
  items,
  name,
  viewState,
}: {
  items: TabSystemTab[];
  name?: string;
  viewState?: [string, (v: string) => unknown];
}) => {
  const innerState = useState<string>(
    items.find((el) => el.id === readSaved(name))?.id || items[0]?.id,
  );
  const [currentTab, setCurrenTab] = viewState || innerState;

  const currentContent = useMemo<ReactNode>(
    () => items.find((tab) => tab.id === currentTab)?.content || null,
    [currentTab, items],
  );

  useEffect(() => {
    if (!name) return;
    try {
      localStorage.setItem(name, currentTab);
    } catch {
      // storage blocked (private mode): the tab just isn't remembered
    }
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
