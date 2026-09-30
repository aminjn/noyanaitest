"use client";

import { useState } from "react";
import classes from "./AdminManageMigrationPage.module.css";
import usePopup from "@/Components/Hooks/usePopup";
import useNotification from "@/Components/Hooks/useNotification";
import { API } from "@/Components/config";
import { fetcher, FetchMethod } from "@/Components/helpers/fetcher";
import Button from "@/Components/UI/Button";
import { ta } from "@/Components/Admin/i18n/adminText";

const nodes: { key: string; title: string }[] = [
  { key: "doctor", get title() {
  return ta("پزشکان");
} },
  { key: "blog", get title() {
  return ta("مقالات");
} },
  { key: "disease", get title() {
  return ta("بیماری‌ها");
} },
  { key: "drug", get title() {
  return ta("داروها");
} },
  { key: "speciality", get title() {
  return ta("تخصص‌ها");
} },
  { key: "symptom", get title() {
  return ta("علائم");
} },
  { key: "part", get title() {
  return ta("اعضای بدن");
} },
];

type MigrationAction = {
  key: string;
  method: FetchMethod;
  title: string;
  description: string;
  danger: boolean;
};

const actions: MigrationAction[] = [
  {
    key: "import",
    method: "POST",
    get title() {
  return ta("انتقال از دیتابیس قدیم");
},
    get description() {
  return ta("رکوردهای دیتابیس قدیم را به دیتابیس جدید منتقل می‌کند.");
},
    danger: false,
  },
  {
    key: "drop",
    method: "PUT",
    get title() {
  return ta("حذف رکوردهای منتقل‌شده");
},
    get description() {
  return ta("فقط رکوردهایی که از دیتابیس قدیم منتقل شده‌اند (و هنوز به آن متصل‌اند) حذف می‌شوند.");
},
    danger: true,
  },
  {
    key: "purge",
    method: "PATCH",
    get title() {
  return ta("قطع اتصال از دیتابیس قدیم");
},
    get description() {
  return ta("اتصال رکوردهای منتقل‌شده به دیتابیس قدیم حذف می‌شود؛ بعد از آن دیگر با «حذف رکوردهای منتقل‌شده» پاک نمی‌شوند.");
},
    danger: true,
  },
  {
    key: "dropAll",
    method: "DELETE",
    get title() {
  return ta("حذف همه رکوردها");
},
    get description() {
  return ta("همه رکوردهای این بخش در دیتابیس جدید حذف می‌شوند، چه منتقل‌شده چه ساخته‌شده در پنل.");
},
    danger: true,
  },
];

// Destructive actions need the section name typed back, so a stray click
// (or a re-submitted request) can't wipe a collection.
const MigrationPopup = ({
  node,
  action,
}: {
  node: { key: string; title: string };
  action: MigrationAction;
}) => {
  const { closePopup } = usePopup();
  const pushNotification = useNotification();
  const [typed, setTyped] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmed = !action.danger || typed.trim() === node.title;

  const run = async () => {
    if (!confirmed || loading) return;
    setLoading(true);
    try {
      await fetcher({ url: `${API}/migrate/${node.key}`, method: action.method });
      pushNotification(ta("${1} (${2}) انجام شد", [action.title, node.title]), "Success");
      closePopup();
    } catch (err) {
      pushNotification((err as Error).message, "Error");
      setLoading(false);
    }
  };

  return (
    <div className={classes.popup}>
      <h3 className={classes.popupTitle}>{`${action.title}: ${node.title}`}</h3>
      <p className={classes.popupText}>{action.description}</p>
      {action.danger && (
        <label className={classes.confirmField}>
          <span>
            {ta("برای تایید، عبارت")} <strong>{node.title}</strong> {ta("را وارد کنید. این عملیات قابل بازگشت نیست.")}
          </span>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} autoFocus />
        </label>
      )}
      <div className={classes.popupActions}>
        <Button
          variant={!confirmed ? "Disable" : action.danger ? "Error" : "Primary"}
          onClick={confirmed ? run : undefined}
          isLoading={loading}
        >
          {action.title}
        </Button>
        <Button variant="Neutral" onClick={() => closePopup()}>
          {ta("انصراف")}
        </Button>
      </div>
    </div>
  );
};

const AdminManageMigrationPage = () => {
  const { setPopup } = usePopup();

  return (
    <div className={classes.main}>
      <header className={classes.header}>
        <h1 className={classes.title}>{ta("مهاجرت داده‌ها")}</h1>
        <p className={classes.subtitle}>
          {ta("انتقال داده از دیتابیس قدیم. عملیات قرمز داده حذف می‌کنند و قابل بازگشت نیستند.")}
        </p>
      </header>
      <div className={classes.grid}>
        {nodes.map((node) => (
          <section key={node.key} className={classes.card}>
            <h2 className={classes.cardTitle}>{node.title}</h2>
            <div className={classes.actions}>
              {actions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  className={`${classes.action} ${action.danger ? classes.danger : ""}`}
                  onClick={() =>
                    setPopup(
                      `migrate-${node.key}-${action.key}`,
                      <MigrationPopup node={node} action={action} />,
                    )
                  }
                >
                  {action.title}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default AdminManageMigrationPage;
