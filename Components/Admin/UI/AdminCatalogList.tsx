"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import usePopup from "@/Components/Hooks/usePopup";
import PopupCard from "@/Components/UI/PopupCard";
import { MongoDoc } from "@/Components/Hooks/useUser";
import HandleLoading from "./HandleLoading";
import WithTitle from "./WithTitle";
import Table, { TableRenderer } from "./Table";
import CreateForm, { FormRenderer } from "./CreateForm";
import TableActions from "./TableActions";
import IconButton from "./IconButton";
import OrderEditor from "./OrderEditor";
import DeleteShitPopup from "./DeleteShitPopup";
import EditIcon from "@/Components/Icons/EditIcon";
import GarbageIcon from "@/Components/Icons/GarbageIcon";
import BooleanToIcon, { booleanToValue } from "@/Components/UI/BooleanToIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

export type CatalogNode = MongoDoc & {
  name?: string;
  title?: string;
  slug?: string;
  isActive?: boolean;
  order?: number;
};

// One list for a small catalog - a category, a tag, a body part (2026-09
// admin audit). Create, edit and delete happen right here in a popup, the
// way Doctolib Pro / Practo Ray back offices edit a reference list; there is
// no separate edit page for a record of three fields.
const CatalogPopup = <T extends CatalogNode>({
  model,
  node,
  noun,
  fields,
  mutate,
}: {
  model: string;
  node?: T;
  noun: string;
  fields: FormRenderer<T>;
  mutate: () => unknown;
}) => {
  const { closePopup } = usePopup();
  return (
    <PopupCard
      title={node ? ta("ویرایش ${1}", [noun]) : ta("${1} جدید", [noun])}
    >
      <CreateForm<T>
        defaultValue={node}
        renderer={fields}
        onCancel={() => closePopup()}
        hookProps={{
          path: node
            ? `${API}/auto/${model}/${node._id}`
            : `${API}/auto/${model}`,
          method: "POST",
          successCb: () => {
            mutate();
            closePopup();
          },
        }}
      />
    </PopupCard>
  );
};

const AdminCatalogList = <T extends CatalogNode>({
  model,
  title,
  noun,
  fields,
  columns,
  labelField = "name",
  showStatus = true,
  access,
}: {
  // the /auto segment, e.g. "clinicTag"
  model: string;
  // list heading, e.g. "تگ کلینیک‌ها"
  title: string;
  // one record, for the popup title ("تگ کلینیک جدید" / "ویرایش تگ کلینیک")
  noun: string;
  fields: FormRenderer<T>;
  // extra columns between the name and the status
  columns?: TableRenderer<T>;
  labelField?: "name" | "title";
  // false for a model without isActive (BlogCategory, Part)
  showStatus?: boolean;
  // per-action access (e.g. useAccessLevel for a limited admin); all allowed
  // when omitted
  access?: { create?: boolean; edit?: boolean; delete?: boolean };
}) => {
  const canCreate = access?.create ?? true;
  const canEdit = access?.edit ?? true;
  const canDelete = access?.delete ?? true;
  const { data, error, mutate } = useSWR<T[]>(
    `${API}/auto/${model}`,
    (url: string) =>
      fetcher({ url }).then((res) =>
        Array.isArray(res?.data?.data) ? res.data.data : [],
      ),
  );
  const { setPopup } = usePopup();
  const open = (node?: T) =>
    setPopup(
      `Catalog-${model}`,
      <CatalogPopup<T>
        model={model}
        node={node}
        noun={noun}
        fields={fields}
        mutate={mutate}
      />,
    );

  const renderer = {
    [labelField]: {
      name: ta("نام"),
      value: (node: T) => node[labelField] || "—",
      filter: "Text",
    },
    ...(columns || {}),
    ...(showStatus
      ? {
          isActive: {
            name: ta("وضعیت"),
            value: (node: T) => booleanToValue[`${!!node.isActive}`],
            component: (node: T) => <BooleanToIcon value={!!node.isActive} />,
            filter: "Set",
          },
        }
      : {}),
    order: {
      name: ta("رتبه"),
      value: (node: T) => node.order ?? 0,
      filter: "Number",
      component: (node: T) => (
        <OrderEditor
          value={node.order ?? 0}
          _id={node._id}
          modelName={model}
          mutate={mutate}
        />
      ),
    },
    actions: {
      name: ta("عملیات"),
      component: (node: T) => (
        <TableActions>
          {canEdit && (
            <IconButton title={ta("ویرایش")} onClick={() => open(node)}>
              <EditIcon />
            </IconButton>
          )}
          {canDelete && (
            <IconButton
              title={ta("حذف")}
              variant="Danger"
              onClick={() =>
                setPopup(
                  `CatalogDelete-${model}`,
                  <DeleteShitPopup
                    modelName={model}
                    nodeId={node._id as unknown as string}
                    mutate={mutate}
                  />,
                )
              }
            >
              <GarbageIcon />
            </IconButton>
          )}
        </TableActions>
      ),
    },
  } as TableRenderer<T>;

  return (
    <HandleLoading data={!!data} error={error}>
      {!!data && (
        <WithTitle
          title={title}
          actions={
            canCreate
              ? [{ title: ta("جدید"), action: () => open() }]
              : undefined
          }
        >
          <Table
            name={`AdminCatalog-${model}`}
            data={data}
            renderer={renderer}
          />
        </WithTitle>
      )}
    </HandleLoading>
  );
};

export default AdminCatalogList;
