"use client";

import { useState } from "react";
import classes from "./CenterDoctorsPage.module.css";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import usePopup from "@/Components/Hooks/usePopup";
import DepartmentPopup from "./DepartmentPopup";
import { CenterDepartment, CenterMember, memberDepartmentId } from "./useCenterDoctors";

const NS: ContentNamespace[] = ["common", "centerDoctors"];

// The centre's own departments (a hospital's wards), on its team page: add,
// edit, hide from / show on the public page, delete. Its doctors are placed
// in a department from their own card.
const CenterDepartments = ({
  departments,
  members,
  busy,
  save,
  remove,
}: {
  departments: CenterDepartment[];
  members: CenterMember[];
  busy: string | null;
  save: (id: string | null, payload: Partial<Omit<CenterDepartment, "_id">>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}) => {
  const getContent = useScopedLocale(NS);
  const { setPopup } = usePopup();
  const [asking, setAsking] = useState<string | null>(null);

  const open = (node?: CenterDepartment) =>
    setPopup(
      "CenterDepartment",
      <DepartmentPopup node={node} onSave={(payload) => save(node?._id || null, payload)} />,
    );

  return (
    <section className={classes.section}>
      <div className={classes.headRow}>
        <h2 className={classes.h2}>
          {getContent("cdDepartments")}
          {!!departments.length && <span className={classes.count}>{departments.length}</span>}
        </h2>
        <button type="button" className={classes.ghost} onClick={() => open()}>
          {getContent("cdAddDepartment")}
        </button>
      </div>
      <p className={classes.hint}>{getContent("cdDepartmentsHint")}</p>
      {!departments.length ? (
        <p className={classes.empty}>{getContent("cdNoDepartments")}</p>
      ) : (
        <ul className={classes.grid}>
          {departments.map((d) => {
            const count = members.filter((m) => memberDepartmentId(m) === d._id).length;
            return (
              <li key={d._id} className={`${classes.card} ${d.active === false ? classes.pending : ""}`}>
                <div className={classes.meta}>
                  <strong>{d.name}</strong>
                  <span>
                    {d.active === false
                      ? getContent("cdDepartmentHidden")
                      : getContent("nPerson", [String(count)])}
                  </span>
                  {!!d.summary && <span>{d.summary}</span>}
                </div>
                {asking === d._id ? (
                  <div className={classes.ask}>
                    <span>{getContent("cdDeleteDepartmentAsk")}</span>
                    <div>
                      <button
                        type="button"
                        className={classes.danger}
                        disabled={busy === d._id}
                        onClick={() => remove(d._id).then(() => setAsking(null))}
                      >
                        {getContent("delete")}
                      </button>
                      <button type="button" className={classes.ghost} onClick={() => setAsking(null)}>
                        {getContent("cancel")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={classes.cardActions}>
                    <button type="button" className={classes.ghost} onClick={() => open(d)}>
                      {getContent("cdEditDepartment")}
                    </button>
                    <button
                      type="button"
                      className={classes.ghost}
                      disabled={busy === d._id}
                      onClick={() => save(d._id, { active: d.active === false })}
                    >
                      {getContent(d.active === false ? "cdShowDepartment" : "cdHideDepartment")}
                    </button>
                    <button type="button" className={classes.ghost} onClick={() => setAsking(d._id)}>
                      {getContent("delete")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default CenterDepartments;
