import { ReactNode, useEffect, useMemo, useState } from "react";
import classes from "./TabSystem.module.css";
import Ixon from "@/Components/UI/Ixon";
import { AdminEmbeddedProvider } from "./AdminEmbedded";

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

  // An icon only helps when it tells the tabs apart: most record pages gave
  // several tabs the same generic info icon, so when any icon repeats the
  // bar shows plain titles instead.
  const showIcons = useMemo(() => {
    const types = items
      .map((tab) =>
        tab.icon && typeof tab.icon === "object" && "type" in tab.icon
          ? (tab.icon as { type: unknown }).type
          : null,
      )
      .filter(Boolean);
    return types.length === items.length && new Set(types).size === types.length;
  }, [items]);

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
            {showIcons && !!tab.icon && (
              <Ixon width="1.125rem">{tab.icon}</Ixon>
            )}
            <span>{tab.title}</span>
          </button>
        ))}
      </div>
      <div className={classes.content} key={currentTab}>
        {/* a list inside a record's tab (its departments, doctors...) is part
            of that page: no second back button or card */}
        <AdminEmbeddedProvider value={true}>{currentContent}</AdminEmbeddedProvider>
      </div>
    </div>
  );
};

export default TabSystem;
