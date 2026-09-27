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
import { AG_GRID_LOCALE_IR } from "@ag-grid-community/locale";
import TableDateInput from "./TableDateInput";
import { WithStyleProps } from "./Loading";
import Ixon from "@/Components/UI/Ixon";
import BooleanToIcon from "@/Components/UI/BooleanToIcon";
import SearchIcon from "@/Components/Icons/SearchIcon";

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
  const columnDefs = useMemo<ColDef<T>[]>(() => {
    // Phones: nothing is pinned (a pinned column would eat the screen) and
    // the name column is narrower; the grid scrolls sideways instead.
    const narrow =
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 600px)").matches;
    const dateFormat = new Intl.DateTimeFormat("fa-IR", {
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
        key === "actions" || /^(عملیات|غملیات)$/.test(column.name.trim());
      if (isActions)
        return {
          colId: key,
          headerName: "",
          pinned: narrow ? undefined : "left",
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
          return value instanceof Date ? dateFormat.format(value) : value;
        },
        headerValueGetter: () => column.name,
        editable: !!column.onEdit,
        valueSetter: column.onEdit,
        cellEditor: !!column.onEdit
          ? `ag${column.filter}CellEditor`
          : undefined,
        cellEditorParams: column.editParams,
      } as ColDef<T>;
    });
  }, [renderer]);

  const defaultColDef = useMemo<ColDef>(() => ({ floatingFilter: true }), []);

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
  const num = useMemo(() => new Intl.NumberFormat("fa-IR"), []);

  const components = useMemo<{ [key: string]: unknown }>(() => {
    return { agDateInput: TableDateInput };
  }, []);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <div className={classes.toolbar}>
        <div className={classes.search}>
          <Ixon width="1.05rem" className={classes.searchIcon}>
            <SearchIcon />
          </Ixon>
          <input
            value={quickFilter}
            onChange={(e) => setQuickFilter(e.target.value)}
            placeholder="جستجو در همه‌ی ستون‌ها..."
          />
        </div>
        <span className={classes.count}>
          {shown !== null && shown !== rows
            ? `${num.format(shown)} از ${num.format(rows)} مورد`
            : `${num.format(rows)} مورد`}
        </span>
      </div>
      <div className={classes.grid}>
      <AgGridReact
        quickFilterText={quickFilter}
        onModelUpdated={(e) => setShown(e.api.getDisplayedRowCount())}
        overlayNoRowsTemplate='<span class="ag-overlay-no-rows-center">موردی برای نمایش وجود ندارد</span>'
        paginationPageSize={50}
        paginationPageSizeSelector={[20, 50, 100, 200]}
        components={components}
        onGridPreDestroyed={onGridPreDestroyed}
        initialState={initialState}
        enableRtl
        localeText={AG_GRID_LOCALE_IR}
        theme={myTheme}
        rowData={Array.isArray(data) ? data : []}
        columnDefs={columnDefs}
        tooltipMouseTrack
        preventDefaultOnContextMenu
        tooltipShowDelay={500}
        defaultColDef={defaultColDef}
        pagination
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
