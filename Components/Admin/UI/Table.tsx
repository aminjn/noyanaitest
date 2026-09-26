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

// Light, quiet grid in the panel's own palette (white header, hairline
// rows, blue only for focus/selection).
const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  accentColor: "#1A80E5",
  backgroundColor: "#FFFFFF",
  borderColor: "#EEF0F3",
  borderRadius: 8,
  browserColorScheme: "light",
  cellHorizontalPadding: 14,
  columnBorder: false,
  fontFamily: "inherit",
  fontSize: 13,
  foregroundColor: "#1F2937",
  headerBackgroundColor: "#F8FAFC",
  headerFontFamily: "inherit",
  headerFontSize: 12,
  headerFontWeight: 600,
  headerTextColor: "#6B7280",
  headerRowBorder: true,
  iconSize: 14,
  oddRowBackgroundColor: "#FFFFFF",
  rowBorder: true,
  rowHoverColor: "#F5F9FE",
  rowHeight: 48,
  headerHeight: 44,
  selectedRowBackgroundColor: "#EAF3FD",
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
          pinned: "left",
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
            ? { flex: 2, minWidth: 200 }
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

  const initialState = useMemo<GridState | undefined>(() => {
    if (!name) return;
    try {
      const saved = localStorage.getItem(name);
      if (!saved) return;
      return JSON.parse(saved);
    } catch {
      return;
    }
  }, [name]);

  const onGridPreDestroyed = useCallback<
    (event: GridPreDestroyedEvent<T>) => void
  >(
    ({ state }) => {
      if (!name) return;
      try {
        localStorage.setItem(name, JSON.stringify(state));
      } catch {}
    },
    [name],
  );

  const [quickFilter, setQuickFilter] = useState("");
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
          {shown !== null && shown !== data.length
            ? `${num.format(shown)} از ${num.format(data.length)} مورد`
            : `${num.format(data.length)} مورد`}
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
        rowData={data}
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
