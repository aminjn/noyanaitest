import { AgGridReact } from "ag-grid-react";
import classes from "./Table.module.css";
import { ReactNode, useCallback, useMemo, useState } from "react";
import {
  ColDef,
  GridPreDestroyedEvent,
  GridState,
  INumberCellEditorParams,
  ValueSetterFunc,
} from "ag-grid-enterprise";
import "ag-grid-enterprise";
import { themeQuartz, iconSetMaterial } from "@ag-grid-community/theming";
import {
  AG_GRID_LOCALE_BR,
  AG_GRID_LOCALE_CN,
  AG_GRID_LOCALE_DE,
  AG_GRID_LOCALE_EG,
  AG_GRID_LOCALE_EN,
  AG_GRID_LOCALE_ES,
  AG_GRID_LOCALE_FR,
  AG_GRID_LOCALE_IR,
  AG_GRID_LOCALE_JP,
  AG_GRID_LOCALE_PK,
  AG_GRID_LOCALE_TR,
} from "@ag-grid-community/locale";
import { useIntlLocale, useLocale } from "@/Components/i18n/navigation";
import { rtlLocales } from "@/Components/i18n/locales";
import useScopedLocale from "@/Components/Hooks/useScopedLocale";
import { ContentNamespace } from "@/Components/Enums/contentNamespaces";
import TableDateInput from "./TableDateInput";
import { WithStyleProps } from "./Loading";
import Ixon from "@/Components/UI/Ixon";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import SearchIcon from "@/Components/Icons/SearchIcon";
import { ta } from "@/Components/Admin/i18n/adminText";

// Quiet grid that sits on the glass card and follows the light/dark
// tokens (every color is a CSS variable, so the theme switch needs no rerender).
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  accentColor: "var(--primary6)",
  backgroundColor: "transparent",
  borderColor: "var(--line)",
  borderRadius: 12,
  browserColorScheme: "inherit",
  cellHorizontalPadding: 16,
  columnBorder: false,
  fontFamily: "inherit",
  fontSize: 13,
  foregroundColor: "var(--gray13)",
  headerBackgroundColor: "transparent",
  headerFontFamily: "inherit",
  headerFontSize: 12,
  headerFontWeight: 700,
  headerTextColor: "var(--gray9)",
  headerRowBorder: true,
  iconSize: 14,
  oddRowBackgroundColor: "transparent",
  rowBorder: true,
  rowHoverColor: "var(--glassStrong)",
  rowHeight: 52,
  headerHeight: 46,
  selectedRowBackgroundColor: "var(--primary1)",
  chromeBackgroundColor: "var(--white)",
  menuBackgroundColor: "var(--white)",
  panelBackgroundColor: "var(--white)",
  inputBackgroundColor: "var(--white)",
  inputBorder: { color: "var(--gray4)" },
  wrapperBorder: false,
  wrapperBorderRadius: 0,
});

const tableFilters = ["Number", "Text", "Date", "Multi", "Set"] as const;

export type TableFilter = (typeof tableFilters)[number];

type TableColumn<T> = {
  filter?: TableFilter;
  name: string;
  value?: (node: T) => ReactNode | Date;
  component?: (node: T) => ReactNode;
  width?: number;
  pin?: "left" | "right";
  onEdit?: ValueSetterFunc<T>;
  editParams?: Partial<INumberCellEditorParams>;
  suppressKeyboardEvents?: boolean;
};

export type TableRenderer<T> = {
  [key in keyof T]?: TableColumn<T>;
} & {
  [key: string]: TableColumn<T>;
};

const LOCALE_NS: ContentNamespace[] = ["common"];

// ag-grid's own UI strings (menus, filters, paging) per site language;
// languages it doesn't ship fall back to English
const gridLocales: Record<string, Record<string, string>> = {
  fa: AG_GRID_LOCALE_IR,
  ar: AG_GRID_LOCALE_EG,
  ur: AG_GRID_LOCALE_PK,
  tr: AG_GRID_LOCALE_TR,
  de: AG_GRID_LOCALE_DE,
  fr: AG_GRID_LOCALE_FR,
  es: AG_GRID_LOCALE_ES,
  pt: AG_GRID_LOCALE_BR,
  zh: AG_GRID_LOCALE_CN,
  ja: AG_GRID_LOCALE_JP,
};

const escapeHtml = (v: string) =>
  v.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// the no-rows overlay is an HTML string (ag-grid), styled from Table.module.css
const emptyIcon =
  '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 7l2.5-4h13L21 7"/><path d="M9 12h6"/></svg>';

const COMPACT_ROWS = 12;

const Table = <T,>({
  data,
  renderer,
  name,
  className = "",
  style,
}: WithStyleProps<{
  data: T[];
  renderer: TableRenderer<T>;
  name?: string;
}>) => {
  const locale = useLocale();
  const intlTag = useIntlLocale();
  const isRtl = (rtlLocales as readonly string[]).includes(locale);
  const getContent = useScopedLocale(LOCALE_NS);

  const columnDefs = useMemo<ColDef<T>[]>(() => {
    // Phones: nothing is pinned (a pinned column would eat the screen) and
    // the name column is narrower; the grid scrolls sideways instead.
    const narrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 600px)").matches;
    const dateFormat = new Intl.DateTimeFormat(intlTag, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    // Plain values get a sensible look without every page repeating it:
    // dates formatted, booleans as status pills.
    const display = (value: unknown): ReactNode => {
      if (value instanceof Date)
        return isNaN(value.getTime()) ? "—" : dateFormat.format(value);
      if (typeof value === "boolean") return <BooleanToIcon value={value} />;
      if (value === null || value === undefined || value === "") return "—";
      return value as ReactNode;
    };
    // One record missing a field must not take the whole page down: a cell
    // whose renderer throws just shows a dash.
    const safe = (render: () => ReactNode): ReactNode => {
      try {
        return render();
      } catch {
        return "—";
      }
    };
    const keys = Object.keys(renderer);
    return keys.map((key, index) => {
      const column = renderer[key];
      // The first column is the record's name/title: it gets the room.
      const isPrimary = index === 0;
      // The row actions column (edit/view/delete): fixed on the end side.
      const isActions =
        key === "actions" ||
        // the column title may already be in the panel's language
        [ta("عملیات"), "عملیات", "غملیات"].includes(column.name.trim());
      if (isActions)
        return {
          colId: key,
          headerName: "",
          // the end side: left in RTL, right in LTR
          pinned: narrow ? undefined : isRtl ? "left" : "right",
          width: column.width || 116,
          resizable: false,
          sortable: false,
          filter: false,
          floatingFilter: false,
          suppressHeaderMenuButton: true,
          suppressMovable: true,
          cellClass: classes.actionsCell,
          cellRenderer: ({ data }: { data: T }) =>
            data ? safe(() => column.component?.(data)) : "",
        } as ColDef<T>;
      return {
        suppressKeyboardEvent: () => column.suppressKeyboardEvents,
        colId: key,
        filter: column.filter ? `ag${column.filter}ColumnFilter` : undefined,
        width: column.width,
        ...(column.width
          ? {}
          : isPrimary
            ? { flex: 2, minWidth: narrow ? 160 : 200 }
            : { flex: 1, minWidth: 130 }),
        sortable: !!column.value,
        initialPinned: column.pin,
        valueGetter: ({ data }) =>
          data && column.value ? safe(() => column.value?.(data) as ReactNode) : null,
        cellRenderer: ({ data }: { data: T }) =>
          data
            ? safe(
                () => column.component?.(data) ?? display(column.value?.(data)),
              )
            : "",
        tooltipValueGetter: ({ data }) => {
          const value = data && column.value ? safe(() => column.value?.(data) as ReactNode) : null;
          // same invalid-date guard as the cell itself
          return value instanceof Date
            ? isNaN(value.getTime())
              ? "—"
              : dateFormat.format(value)
            : value;
        },
        headerValueGetter: () => ta(column.name),
        editable: !!column.onEdit,
        valueSetter: column.onEdit,
        cellEditor: !!column.onEdit
          ? `ag${column.filter}CellEditor`
          : undefined,
        cellEditorParams: column.editParams,
      } as ColDef<T>;
    });
  }, [renderer, intlTag, isRtl]);

  // Short lists (offices, secretaries, FAQs…) don't need a spreadsheet:
  // no filter row, no paging, and the grid is only as tall as its rows.
  // Long lists keep the full toolset.
  const dataRows = Array.isArray(data) ? data.length : 0;
  const compact = dataRows > 0 && dataRows <= COMPACT_ROWS;
  const defaultColDef = useMemo<ColDef>(() => ({ floatingFilter: !compact }), [compact]);

  // Saved column layout per table; the version suffix drops layouts saved
  // before the column redesign.
  const storageKey = name ? `${name}:v2` : undefined;

  const initialState = useMemo<GridState | undefined>(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return;
      return JSON.parse(saved);
    } catch {
      return;
    }
  }, [storageKey]);

  const onGridPreDestroyed = useCallback<
    (event: GridPreDestroyedEvent<T>) => void
  >(
    ({ state }) => {
      if (!storageKey) return;
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {}
    },
    [storageKey],
  );

  const [quickFilter, setQuickFilter] = useState("");
  // Some endpoints answer with a non-array on errors; never crash on that.
  const rows = Array.isArray(data) ? data.length : 0;
  const [shown, setShown] = useState<number | null>(null);
  const num = useMemo(() => new Intl.NumberFormat(intlTag), [intlTag]);
  const emptyText = getContent("tbEmpty");
  const noRowsTemplate = useMemo(
    () =>
      `<div class="tb-empty"><span class="tb-empty-icon">${emptyIcon}</span><span>${escapeHtml(emptyText)}</span></div>`,
    [emptyText],
  );

  const components = useMemo<{ [key: string]: unknown }>(() => {
    return { agDateInput: TableDateInput };
  }, []);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      {dataRows > 5 && (
      <div className={classes.toolbar}>
        <div className={classes.search}>
          <Ixon width="1.05rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder={getContent("tbSearch")}
            aria-label={getContent("tbSearch")}
          />
        </div>
        <span className={classes.count}>
          {shown !== null && shown !== rows
            ? getContent("tbCountOf", [num.format(shown), num.format(rows)])
            : getContent("tbCount", [num.format(rows)])}
        </span>
      </div>
      )}
      <div
        className={`${classes.grid} ${!rows ? classes.gridEmpty : ""} ${compact ? classes.gridCompact : ""}`}
      >
      <AgGridReact
        quickFilterText={quickFilter}
        onModelUpdated={(e) => setShown(e.api.getDisplayedRowCount())}
        overlayNoRowsTemplate={noRowsTemplate}
        paginationPageSize={50}
        paginationPageSizeSelector={[20, 50, 100, 200]}
        components={components}
        onGridPreDestroyed={onGridPreDestroyed}
        initialState={initialState}
        enableRtl={isRtl}
        localeText={gridLocales[locale] || AG_GRID_LOCALE_EN}
        theme={myTheme}
        rowData={Array.isArray(data) ? data : []}
        columnDefs={columnDefs}
        tooltipMouseTrack
        preventDefaultOnContextMenu
        tooltipShowDelay={500}
        defaultColDef={defaultColDef}
        pagination={!compact}
        domLayout={compact ? "autoHeight" : "normal"}
        suppressScrollOnNewData
        stopEditingWhenCellsLoseFocus
        singleClickEdit
        // onCellValueChanged={(e) => {
        //   console.log(e);
        // }}
      />
      </div>
    </div>
  );
};
export default Table;
