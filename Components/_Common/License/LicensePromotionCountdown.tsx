"use client";

import { useEffect, useMemo, useState } from "react";
import classes from "./LicensePromotionCountdown.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import { ContentKey } from "@/Components/Enums/contentKeys";
import { useIntlLocale } from "@/Components/i18n/navigation";

const LOCALE_NS: ContentNamespace[] = ["sharedLicense"];

// Time left on a plan promotion (2026-10): "3 days and 04:12:09 left".
// Drawn only after mount (the server's clock is not the visitor's) and
// gone once the promotion has ended.
const LicensePromotionCountdown = ({
  endsAt,
  className = "",
  compact,
}: {
  endsAt?: string | null;
  className?: string;
  compact?: boolean;
}) => {
  const getContent = useScopedLocale(LOCALE_NS);
  const intlTag = useIntlLocale();
  const end = useMemo(() => {
    const t = endsAt ? new Date(endsAt).getTime() : NaN;
    return Number.isFinite(t) ? t : null;
  }, [endsAt]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    if (!end) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end]);

  const two = useMemo(() => new Intl.NumberFormat(intlTag, { minimumIntegerDigits: 2 }), [intlTag]);
  const plain = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);

  if (!end || now === null) return null;
  const left = Math.max(0, end - now);
  if (left <= 0) return null;
  const s = Math.floor(left / 1000);
  const days = Math.floor(s / 86400);
  const time = [Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]
    .map((n) => two.format(n))
    .join(":");
  const text = days > 0
    ? getContent("licensePromoEndsInDays" as ContentKey, [plain.format(days), time])
    : getContent("licensePromoEndsIn" as ContentKey, [time]);

  return (
    <span
      className={`${classes.main} ${compact ? classes.compact : ""} ${className}`}
      role="timer"
      aria-live="off"
    >
      {text}
    </span>
  );
};

export default LicensePromotionCountdown;
