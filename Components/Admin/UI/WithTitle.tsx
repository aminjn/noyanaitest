import {
  Fragment,
  MouseEventHandler,
  ReactNode,
  useEffect,
  useState,
} from "react";
import classes from "./WithTitle.module.css";
import { WithStyleProps } from "./Loading";
import Box from "./Box";
import Title from "./Title";
import Button from "@/Components/UI/Button";
import Ixon from "@/Components/UI/Ixon";
import MenuIcon from "@/Components/Icons/MenuIcon";
import IconButton from "./IconButton";
import ArrowLeftIcon from "@/Components/Icons/ArrowLeftIcon";
import PlusIcon from "@/Components/Icons/PlusIcon";
import { useRouter } from "@/Components/i18n/navigation";
import { ta } from "@/Components/Admin/i18n/adminText";

const WithTitle = ({
  children,
  title,
  actions,
  className = "",
  style,
  collapsed,
}: WithStyleProps<{
  children?: ReactNode;
  title: string;
  actions?: {
    title: string;
    action?: MouseEventHandler<HTMLButtonElement>;
    icon?: ReactNode;
  }[];
  collapsed?: ReactNode;
}>) => {
  const [isContextOpen, setIsContextOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isContextOpen) {
      const listener = () => setIsContextOpen(false);
      setTimeout(() => document.addEventListener("click", listener, false));
      return () => document.removeEventListener("click", listener, false);
    }
  }, [isContextOpen]);

  const { back } = useRouter();
  return (
    <Box className={`${classes.main} ${className}`} style={style}>
      <div className={classes.header}>
        <div className={classes.titleBox}>
          <IconButton
            onClick={() => back()}
            variant="Neutral"
            title={ta("بازگشت")}
            style={{ transform: "rotateZ(180deg)" }}
          >
            <ArrowLeftIcon />
          </IconButton>
          <Title>{typeof title === "string" ? ta(title) : title}</Title>
        </div>
        <div className={classes.headerActions}>
          {(!!actions?.length || !!collapsed) && (
            <Fragment>
              {!!collapsed && (
                <div className={classes.collapsed}>{collapsed}</div>
              )}
              {!!actions?.length && (
                <div className={classes.actions}>
                  <Fragment>
                    {actions.length === 1 ? (
                      <Button
                        type="button"
                        size="M"
                        leadIcon={
                          actions[0].icon ||
                          ([ta("جدید"), "جدید"].includes(actions[0].title) ? <PlusIcon /> : undefined)
                        }
                        onClick={actions[0].action}
                      >
                        {ta(actions[0].title)}
                      </Button>
                    ) : (
                      <Fragment>
                        <button
                          className={classes.contextBtn}
                          type="button"
                          onClick={() => setIsContextOpen(true)}
                        >
                          <Ixon width="1.5rem">
                            <MenuIcon />
                          </Ixon>
                        </button>
                        <div
                          className={`${classes.context} ${
                            isContextOpen ? classes.open : ""
                          }`}
                          style={{
                            maxHeight: isContextOpen
                              ? `${actions.length * 3}rem`
                              : 0,
                          }}
                        >
                          {actions.map((action) => (
                            <button
                              key={action.title}
                              className={classes.action}
                              onClick={action.action}
                              type="button"
                            >
                              {action.icon && (
                                <Ixon
                                  width="1.5rem"
                                  className={classes.actionIcon}
                                >
                                  {action.icon}
                                </Ixon>
                              )}
                              <span>{ta(action.title)}</span>
                            </button>
                          ))}
                        </div>
                      </Fragment>
                    )}
                  </Fragment>
                </div>
              )}
            </Fragment>
          )}
        </div>
      </div>
      <div className={classes.content}>{children}</div>
    </Box>
  );
};

export default WithTitle;
