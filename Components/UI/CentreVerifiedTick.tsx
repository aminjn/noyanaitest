"use client";

import Ixon from "./Ixon";
import VerifySolidIcon from "../Icons/VerfySolidIcon";
import useScopedLocale from "../Hooks/useScopedLocale";
import { ContentNamespace } from "../Enums/contentNamespaces";
import classes from "./CentreVerifiedTick.module.css";

const NS: ContentNamespace[] = ["common", "centreCard"];

// The verified tick of a centre (2026-10, backend Lib/centreVerified.ts):
// a valid, non-expired licence the staff approved - not "has an owner
// account". The one tick of the centre card (Components/UI/CentreCard) and
// the centre pages; it renders nothing unless the backend said `verified`.
const CentreVerifiedTick = ({
  verified,
  size = "1rem",
  className = "",
}: {
  verified?: unknown;
  size?: string;
  className?: string;
}) => {
  const getContent = useScopedLocale(NS);
  if (verified !== true) return null;
  const label = getContent("centreVerified");
  return (
    <span className={`${classes.tick} ${className}`} title={label} aria-label={label} role="img">
      <Ixon width={size}>
        <VerifySolidIcon />
      </Ixon>
    </span>
  );
};

export default CentreVerifiedTick;
