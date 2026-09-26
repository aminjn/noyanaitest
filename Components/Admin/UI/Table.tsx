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
    if (!true) return [{}];
    return Object.keys(renderer).map(
      (key) =>
        ({
          suppressKeyboardEvent: () => renderer[key].suppressKeyboardEvents,
          colId: key,
          filter: renderer[key].filter
            ? `ag${renderer[key].filter}ColumnFilter`
            : undefined,
          width: renderer[key].width,
          sortable: !!renderer[key].value,
          initialPinned: renderer[key].pin,
          valueGetter: ({ data }) =>
            data
              ? !!renderer[key].value
                ? renderer[key].value?.(data)
                : null
              : null,
          cellRenderer: ({ data }: { data: T }) =>
            data
              ? renderer[key].component?.(data) || renderer[key].value?.(data)
              : "",
          tooltipValueGetter: ({ data }) =>
            data ? renderer[key].value?.(data) : null,
          headerValueGetter: () => renderer[key].name,
          editable: !!renderer[key].onEdit,
          valueSetter: renderer[key].onEdit,
          cellEditor: !!renderer[key].onEdit
            ? `ag${renderer[key].filter}CellEditor`
            : undefined,
          cellEditorParams: renderer[key].editParams,
        }) as ColDef<T>,
    );
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
