"use client";

import { useState } from "react";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import HandleLoading from "@/Components/Admin/UI/HandleLoading";
import Table from "@/Components/Admin/UI/Table";
import DateInput from "@/Components/UI/DateInput";
import Link from "@/Components/i18n/Link";
import classes from "../../Accounting.module.css";
import crm from "../Crm.module.css";
import s from "./Service.module.css";
import { isoDay, useBizFormat } from "../../bizShared";
import { CrmContext } from "../crmShared";
import { useRouter } from "@/Components/i18n/navigation";
import { Badge, ConfirmButton, ContactField, listOf, Ref, TeamOptions, useCall, useCrm, useCrmText, useGet, useTeamName, useWhen } from "./svc";

// «کارهای تیم» (2026-10), nexxacrm's projects + timesheet: boards of team
// tasks - a patient's surgery coordination, a lab's monthly quality
// control - in columns; a task is about a patient, given to a team member,
// with a priority, a due date (reminded in-app) and sub-tasks. Moving a
// task to a closed column marks it done; hours are logged on tasks.

type Stage = { _id: string; name: string; isClosed: boolean };
type Project = {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  dueAt?: string;
  status: "active" | "onHold" | "done" | "cancelled";
  stages: Stage[];
  contact?: { _id: string; name?: string; phone: string } | null;
  tasks?: number;
  done?: number;
};
type Task = {
  _id: string;
  title: string;
  description?: string;
  stage: string;
  parent?: string;
  priority: number;
  dueAt?: string;
  assignee?: string;
  contact?: { _id: string; name?: string; phone: string } | null;
  done: boolean;
  hours?: number;
  project?: { _id: string; name: string; color?: string } | string;
};
type TimeLog = { _id: string; hours: number; date: string; note?: string; billable: boolean; user: string; task?: { title: string; project?: { name: string } } | null };

const PROJECT_STATUSES = ["active", "onHold", "done", "cancelled"] as const;
const projectStatusKey: Record<Project["status"], string> = { active: "crmeProjActive", onHold: "crmeProjOnHold", done: "crmeProjDone", cancelled: "crmeProjCancelled" };
const prioKey = ["crmePrLow", "crmePrNormal", "crmePrHigh", "crmePrUrgent"];

const ProjectPopup = ({ project, onDone }: { project?: Project; onDone: (id?: string) => unknown }) => {
  const t = useCrmText();
  const call = useCall();
  const { closePopup } = usePopup();
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState<Project["status"]>(project?.status || "active");
  const [contact, setContact] = useState<Ref>(project?.contact || null);
  const [due, setDue] = useState<Date | null>(project?.dueAt ? new Date(project.dueAt) : null);
  const [stages, setStages] = useState<Stage[]>(
    project?.stages?.length
      ? project.stages
      : [
          { _id: "", name: t("crmeStageTodo"), isClosed: false },
          { _id: "", name: t("crmeStageDoing"), isClosed: false },
          { _id: "", name: t("crmeStageDone"), isClosed: true },
        ],
  );
  const save = async () => {
    const r = await call<Project>(project ? "PATCH" : "POST", `/projects${project ? `/${project._id}` : ""}`, {
      name,
      description: description || null,
      status,
      contact: contact?._id || null,
      dueAt: due ? isoDay(due) : null,
      stages: stages.map((x) => ({ ...(x._id ? { _id: x._id } : {}), name: x.name, isClosed: x.isClosed })),
    });
    if (r) {
      closePopup("CrmeProject");
      onDone(r._id);
    }
  };
  return (
    <PopupCard title={t(project ? "crmeEditBoard" : "crmeNewBoard")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeBoardName")}
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
          </label>
          <div className={s.wideField}>
            <ContactField value={contact} onChange={setContact} label="crmeAboutPatient" />
          </div>
          <div className={classes.field}>
            <DateInput title={t("crmeDueDate")} defaultValue={due || undefined} onChange={(d) => setDue(d)} />
          </div>
          {project && (
            <label className={classes.field}>
              {t("crmeStatus")}
              <select value={status} onChange={(e) => setStatus(e.target.value as Project["status"])}>
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {t(projectStatusKey[st])}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeDescription")}
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={2000} />
          </label>
        </div>
        <h3 className={classes.cardTitle}>{t("crmeColumns")}</h3>
        {stages.map((st, i) => (
          <div key={st._id || i} className={s.row}>
            <input value={st.name} maxLength={40} onChange={(e) => setStages((x) => x.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)))} />
            <label className={s.row}>
              <input type="checkbox" checked={st.isClosed} onChange={(e) => setStages((x) => x.map((y, j) => (j === i ? { ...y, isClosed: e.target.checked } : y)))} />
              {t("crmeClosedColumn")}
            </label>
            {stages.length > 1 && (
              <button type="button" className={crm.linkDanger} onClick={() => setStages((x) => x.filter((_, j) => j !== i))}>
                {t("bizDelete")}
              </button>
            )}
          </div>
        ))}
        {stages.length < 10 && (
          <button type="button" className={crm.linkButton} onClick={() => setStages((x) => [...x, { _id: "", name: "", isClosed: false }])}>
            {t("crmeAddColumn")}
          </button>
        )}
        <div className={classes.actions}>
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeProject")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={name.trim().length < 2 || stages.some((x) => !x.name.trim())} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
      </div>
    </PopupCard>
  );
};

const TaskPopup = ({ projectId, stages, task, parents, onDone }: { projectId: string; stages: Stage[]; task?: Task; parents: Task[]; onDone: () => unknown }) => {
  const t = useCrmText();
  const w = useWhen();
  const call = useCall();
  const nameOf = useTeamName();
  const { canWrite } = useCrm();
  const { closePopup } = usePopup();
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [stage, setStage] = useState(task?.stage || stages[0]?._id || "");
  const [priority, setPriority] = useState(task?.priority ?? 1);
  const [due, setDue] = useState<Date | null>(task?.dueAt ? new Date(task.dueAt) : null);
  const [assignee, setAssignee] = useState(task?.assignee || "");
  const [contact, setContact] = useState<Ref>(task?.contact || null);
  const [parent, setParent] = useState(task?.parent || "");
  const [hours, setHours] = useState("");
  const [note, setNote] = useState("");
  const logs = useGet<TimeLog[]>(task ? `/tasks/${task._id}/time` : null, (d) => listOf<TimeLog>(d));
  const save = async () => {
    const payload = { title, description: description || null, stage, priority, dueAt: due ? isoDay(due) : null, assignee: assignee || null, contact: contact?._id || null };
    const ok = task ? await call("PATCH", `/tasks/${task._id}`, payload) : await call("POST", `/projects/${projectId}/tasks`, { ...payload, parent: parent || null });
    if (ok) {
      closePopup("CrmeTask");
      onDone();
    }
  };
  return (
    <PopupCard title={t(task ? "crmeEditTask" : "crmeNewTask")}>
      <div className={classes.popup}>
        <div className={s.stepFields}>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeTaskTitle")}
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
          </label>
          <label className={classes.field}>
            {t("crmeColumn")}
            <select value={stage} onChange={(e) => setStage(e.target.value)}>
              {stages.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmePriority")}
            <select value={priority} onChange={(e) => setPriority(Number(e.target.value))}>
              {prioKey.map((k, i) => (
                <option key={k} value={i}>
                  {t(k)}
                </option>
              ))}
            </select>
          </label>
          <label className={classes.field}>
            {t("crmAssignee")}
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              <TeamOptions none="crmAssigneeNone" />
            </select>
          </label>
          <div className={classes.field}>
            <DateInput title={t("crmeDueDate")} defaultValue={due || undefined} onChange={(d) => setDue(d)} />
          </div>
          {!task && parents.length > 0 && (
            <label className={classes.field}>
              {t("crmeParentTask")}
              <select value={parent} onChange={(e) => setParent(e.target.value)}>
                <option value="">—</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className={s.wideField}>
            <ContactField value={contact} onChange={setContact} label="crmeAboutPatient" />
          </div>
          <label className={`${classes.field} ${s.wideField}`}>
            {t("crmeDescription")}
            <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={3000} />
          </label>
        </div>
        <div className={classes.actions}>
          {task && canWrite && (
            <ConfirmButton onConfirm={async () => { if (await call("DELETE", `/tasks/${task._id}`)) { closePopup("CrmeTask"); onDone(); } }}>{t("bizDelete")}</ConfirmButton>
          )}
          <button type="button" className={classes.ghost} onClick={() => closePopup("CrmeTask")}>
            {t("bizCancel")}
          </button>
          <button type="button" className={classes.primary} disabled={!title.trim()} onClick={save}>
            {t("bizSave")}
          </button>
        </div>
        {task && (
          <>
            <h3 className={classes.cardTitle}>{t("crmeHours")}</h3>
            <div className={s.row}>
              <input type="number" min={0.25} step={0.25} dir="ltr" value={hours} onChange={(e) => setHours(e.target.value)} placeholder={t("crmeHoursN")} aria-label={t("crmeHoursN")} />
              <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} placeholder={t("crmNote")} />
              <button
                type="button"
                className={classes.ghost}
                disabled={!(Number(hours) > 0)}
                onClick={async () => {
                  if (await call("POST", `/tasks/${task._id}/time`, { hours: Number(hours), note: note || null })) {
                    setHours("");
                    setNote("");
                    logs.mutate();
                    onDone();
                  }
                }}
              >
                {t("crmeLogTime")}
              </button>
            </div>
            <ul className={crm.miniList}>
              {listOf<TimeLog>(logs.data).map((l) => (
                <li key={l._id} className={s.between}>
                  <span>
                    {t("crmeHoursValue", [w.num(l.hours)])} · {nameOf(l.user)} · <span className={classes.muted}>{w.at(l.date)}</span>
                    {l.note ? ` · ${l.note}` : ""}
                  </span>
                  <ConfirmButton onConfirm={async () => { if (await call("DELETE", `/time/${l._id}`)) { logs.mutate(); onDone(); } }}>{t("bizDelete")}</ConfirmButton>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </PopupCard>
  );
};

const TaskCard = ({ task, onOpen, onToggle, subs }: { task: Task; onOpen: () => void; onToggle: () => void; subs: number }) => {
  const t = useCrmText();
  const f = useBizFormat();
  const nameOf = useTeamName();
  const late = !task.done && task.dueAt && new Date(task.dueAt).getTime() < Date.now();
  return (
    <div className={`${s.taskCard} ${s[`prio${task.priority}`] || ""}`}>
      <div className={s.between}>
        <label className={s.row}>
          <input type="checkbox" checked={task.done} onChange={onToggle} aria-label={t("crmMarkDone")} />
          <button type="button" className={`${s.taskTitle} ${task.done ? s.taskDone : ""}`} onClick={onOpen}>
            {task.title}
          </button>
        </label>
      </div>
      <span className={classes.muted}>
        {task.contact?.name ? `${task.contact.name} · ` : ""}
        {task.assignee ? nameOf(task.assignee) : t("crmAssigneeNone")}
        {subs ? ` · ${t("crmeSubsN", [String(subs)])}` : ""}
      </span>
      <span className={s.row}>
        {task.dueAt && <Badge tone={late ? "bad" : undefined}>{f.date(task.dueAt)}</Badge>}
        {!!task.hours && <Badge tone="muted">{t("crmeHoursValue", [f.money(task.hours)])}</Badge>}
      </span>
    </div>
  );
};

const Board = ({ id }: { id: string }) => {
  const t = useCrmText();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const call = useCall();
  const router = useRouter();
  const { setPopup } = usePopup();
  const { data, error, mutate } = useGet<{ project: Project; tasks: Task[] } | null>(`/projects/${id}`, (d) => (d && typeof d === "object" ? (d as never) : null));
  const wrap = (n: React.ReactNode) => <CrmContext.Provider value={ctx}>{n}</CrmContext.Provider>;
  const p = data?.project;
  const tasks = listOf<Task>(data?.tasks);
  const top = tasks.filter((x) => !x.parent);
  const openTask = (task?: Task) =>
    p && setPopup("CrmeTask", wrap(<TaskPopup projectId={p._id} stages={p.stages} task={task} parents={top} onDone={() => mutate()} />));
  return (
    <HandleLoading data={!!data} error={error}>
      {!!p && (
        <div className={s.stack}>
          <section className={classes.card}>
            <div className={classes.cardHead}>
              <div className={s.stack}>
                <Link href={`${panel}/crm/tasks`} className={crm.linkButton}>
                  {t("back")}
                </Link>
                <h2 className={classes.cardTitle}>{p.name}</h2>
                <span className={classes.muted}>
                  {p.contact?.name ? `${p.contact.name} · ` : ""}
                  {t(projectStatusKey[p.status])}
                </span>
              </div>
              <div className={s.row}>
                <button type="button" className={classes.primary} onClick={() => openTask()}>
                  {t("crmeNewTask")}
                </button>
                {canWrite && (
                  <>
                    <button type="button" className={classes.ghost} onClick={() => setPopup("CrmeProject", wrap(<ProjectPopup project={p} onDone={() => mutate()} />))}>
                      {t("bizEdit")}
                    </button>
                    <ConfirmButton onConfirm={async () => (await call("DELETE", `/projects/${id}`)) && router.push(`${panel}/crm/tasks`)}>{t("bizDelete")}</ConfirmButton>
                  </>
                )}
              </div>
            </div>
            {p.description && <p className={s.hint}>{p.description}</p>}
          </section>
          <div className={s.board}>
            {p.stages.map((st) => {
              const col = tasks.filter((x) => x.stage === st._id);
              return (
                <div key={st._id} className={s.column}>
                  <div className={s.columnHead}>
                    <span>{st.name}</span>
                    <Badge tone={st.isClosed ? "ok" : "muted"}>{col.length}</Badge>
                  </div>
                  {col.map((task) => (
                    <div key={task._id} className={s.stack}>
                      <TaskCard
                        task={task}
                        subs={tasks.filter((x) => x.parent === task._id).length}
                        onOpen={() => openTask(task)}
                        onToggle={async () => (await call("POST", `/tasks/${task._id}/toggle`, undefined, false)) && mutate()}
                      />
                      <select
                        className={crm.inlineSelect}
                        value={task.stage}
                        aria-label={t("crmeMoveTo")}
                        onChange={async (e) => (await call("PATCH", `/tasks/${task._id}`, { stage: e.target.value }, false)) && mutate()}
                      >
                        {p.stages.map((x) => (
                          <option key={x._id} value={x._id}>
                            {t("crmeMoveToN", [x.name])}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </HandleLoading>
  );
};

const Boards = () => {
  const t = useCrmText();
  const f = useBizFormat();
  const ctx = useCrm();
  const { panel, canWrite } = ctx;
  const router = useRouter();
  const call = useCall();
  const { setPopup } = usePopup();
  const [status, setStatus] = useState("active");
  const { data, error, mutate } = useGet<Project[]>(`/projects?status=${status}`, (d) => listOf<Project>(d));
  const mine = useGet<Task[]>("/tasks/mine", (d) => listOf<Task>(d));
  return (
    <div className={s.stack}>
      <section className={classes.card}>
        <h2 className={classes.cardTitle}>{t("crmeMyTasks")}</h2>
        <HandleLoading data={!!mine.data} error={mine.error}>
          {!listOf(mine.data).length ? (
            <p className={classes.empty}>{t("crmeNoMyTasks")}</p>
          ) : (
            <ul className={crm.miniList}>
              {listOf<Task>(mine.data).map((task) => {
                const proj = typeof task.project === "object" ? task.project : null;
                const late = task.dueAt && new Date(task.dueAt).getTime() < Date.now();
                return (
                  <li key={task._id} className={s.between}>
                    <label className={s.row}>
                      <input type="checkbox" checked={false} onChange={async () => (await call("POST", `/tasks/${task._id}/toggle`, undefined, false)) && mine.mutate()} aria-label={t("crmMarkDone")} />
                      <span>{task.title}</span>
                    </label>
                    <span className={s.row}>
                      {proj && (
                        <Link href={`${panel}/crm/tasks/${proj._id}`} className={crm.linkButton}>
                          {proj.name}
                        </Link>
                      )}
                      {task.dueAt && <Badge tone={late ? "bad" : undefined}>{f.date(task.dueAt)}</Badge>}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </HandleLoading>
      </section>
      <section className={classes.card}>
        <div className={classes.cardHead}>
          <div className={classes.segmented} role="tablist">
            {["active", "onHold", "done", "all"].map((st) => (
              <button key={st} type="button" role="tab" aria-selected={status === st} className={status === st ? classes.on : ""} onClick={() => setStatus(st)}>
                {t(st === "all" ? "all" : projectStatusKey[st as Project["status"]])}
              </button>
            ))}
          </div>
          {canWrite && (
            <button
              type="button"
              className={classes.primary}
              onClick={() => setPopup("CrmeProject", <CrmContext.Provider value={ctx}><ProjectPopup onDone={(id) => { mutate(); if (id) router.push(`${panel}/crm/tasks/${id}`); }} /></CrmContext.Provider>)}
            >
              {t("crmeNewBoard")}
            </button>
          )}
        </div>
        <HandleLoading data={!!data} error={error}>
          {!!data &&
            (!data.length ? (
              <p className={classes.empty}>{t("crmeNoBoards")}</p>
            ) : (
              <Table
                data={data}
                name="CrmBoards"
                renderer={{
                  name: { name: t("crmeBoardName"), value: (p) => p.name, filter: "Text", component: (p) => <Link href={`${panel}/crm/tasks/${p._id}`}>{p.name}</Link> },
                  contact: { name: t("crmeAboutPatient"), value: (p) => p.contact?.name || "" },
                  progress: { name: t("crmeProgress"), value: (p) => `${p.done || 0} / ${p.tasks || 0}` },
                  dueAt: { name: t("crmeDueDate"), value: (p) => (p.dueAt ? new Date(p.dueAt) : ""), filter: "Date" },
                  status: { name: t("crmeStatus"), value: (p) => t(projectStatusKey[p.status]), filter: "Set" },
                }}
              />
            ))}
        </HandleLoading>
      </section>
    </div>
  );
};

export const CrmTimesheet = () => {
  const t = useCrmText();
  const w = useWhen();
  const nameOf = useTeamName();
  const [from, setFrom] = useState<Date | null>(new Date(Date.now() - 7 * 864e5));
  const [to, setTo] = useState<Date | null>(new Date());
  const [user, setUser] = useState("");
  const p = new URLSearchParams();
  if (from) p.set("from", isoDay(from));
  if (to) p.set("to", `${isoDay(to)}T23:59:59`);
  if (user) p.set("user", user);
  const { data, error } = useGet<{ rows: TimeLog[] } | null>(`/timesheet?${p}`, (d) => (d && typeof d === "object" ? (d as never) : null));
  const rows = listOf<TimeLog>(data?.rows);
  const totals = new Map<string, number>();
  for (const r of rows) totals.set(r.user, (totals.get(r.user) || 0) + r.hours);
  return (
    <section className={classes.card}>
      <div className={classes.filters}>
        <div className={classes.field}>
          <DateInput title={t("crmeFrom")} defaultValue={from || undefined} onChange={(d) => setFrom(d)} />
        </div>
        <div className={classes.field}>
          <DateInput title={t("crmeTo")} defaultValue={to || undefined} onChange={(d) => setTo(d)} />
        </div>
        <label className={classes.field}>
          {t("crmeMember")}
          <select value={user} onChange={(e) => setUser(e.target.value)}>
            <TeamOptions none="all" />
          </select>
        </label>
      </div>
      <div className={classes.tiles}>
        {[...totals.entries()].map(([u, h]) => (
          <div key={u} className={classes.tile}>
            <span className={classes.tileLabel}>{nameOf(u) || "—"}</span>
            <span className={classes.tileValue}>{t("crmeHoursValue", [w.num(h)])}</span>
          </div>
        ))}
      </div>
      <HandleLoading data={!!data} error={error}>
        <Table
          data={rows}
          name="CrmTimesheet"
          renderer={{
            date: { name: t("bizDate"), value: (r) => new Date(r.date), filter: "Date" },
            user: { name: t("crmeMember"), value: (r) => nameOf(r.user), filter: "Set" },
            board: { name: t("crmeBoardName"), value: (r) => r.task?.project?.name || "", filter: "Set" },
            task: { name: t("crmeTaskTitle"), value: (r) => r.task?.title || "" },
            hours: { name: t("crmeHours"), value: (r) => r.hours, filter: "Number" },
            note: { name: t("crmNote"), value: (r) => r.note || "" },
          }}
        />
      </HandleLoading>
    </section>
  );
};

const CrmTasks = ({ id }: { id?: string }) => (id ? <Board id={id} /> : <Boards />);

export default CrmTasks;
