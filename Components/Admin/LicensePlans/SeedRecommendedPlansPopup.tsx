"use client";

import { Fragment, useState } from "react";
import PopupCard from "@/Components/UI/PopupCard";
import ConfirmationPopup from "../UI/ConfirmationPopup";
import Act from "@/Components/UI/Act";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { API } from "@/Components/config";
import { ta } from "@/Components/Admin/i18n/adminText";
import { LicenseOrg } from "@/Components/_Common/License/licenseTypes";

// «ساخت پلن‌های پیشنهادی» (2026-10): creates the recommended lineup this
// provider kind is missing - free (default), professional (best seller)
// and premium, with 3/6/12-month prices (noyanai-back Lib/licenseTiers.ts).
// An existing plan is never changed; a tier whose name is already taken
// is skipped.
const SeedRecommendedPlansPopup = ({
  kind,
  mutate,
}: {
  kind: LicenseOrg;
  mutate: () => unknown;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  return (
    <PopupCard title={ta("ساخت پلن‌های پیشنهادی")}>
      <Fragment>
        <ConfirmationPopup
          message={ta(
            "پلن‌های رایگان (پیش‌فرض)، حرفه‌ای (پرفروش) و ویژه با قیمت ۳، ۶ و ۱۲ ماهه ساخته می‌شوند. پلن‌های موجود تغییر نمی‌کنند و پلنی که هم‌نامش وجود دارد ساخته نمی‌شود.",
          )}
          isLoading={isLoading}
          onConfirm={() => setIsLoading(true)}
        />
        <Act<{ data?: { created?: string[] } }>
          path={isLoading ? `${API}/licensePlans/seed/${kind}` : null}
          method="POST"
          onDone={(status, result) => {
            setIsLoading(false);
            if (!status) return;
            const created = Array.isArray(result?.data?.created) ? result.data.created : [];
            pushNotification(
              created.length
                ? ta("پلن‌های ساخته‌شده: ${1}", [created.join("، ")])
                : ta("همه‌ی پلن‌های پیشنهادی از قبل وجود دارند"),
              created.length ? "Success" : "Warn",
            );
            mutate();
            closePopup();
          }}
        />
      </Fragment>
    </PopupCard>
  );
};

export default SeedRecommendedPlansPopup;
