import { AgGridReact } from "ag-grid-react";
import classes from "./Table.module.css";
import { ReactNode, useCallback, useMemo } from "react";
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
import Input from "@/Components/UI/Input";

const myTheme = themeQuartz.withPart(iconSetMaterial).withParams({
  borderRadius: 16,
  browserColorScheme: "light",
  columnBorder: false,
  fontFamily: "inherit",
  headerBackgroundColor: "#1A80E5",
  headerFontFamily: "inherit",
  headerFontSize: 14,
  headerTextColor: "#FFFFFF",
  iconSize: 14,
  wrapperBorderRadius: 16,
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

  const components = useMemo<{ [key: string]: unknown }>(() => {
    return { agDateInput: TableDateInput };
  }, []);

  return (
    <div className={`${classes.main} ${className}`} style={style}>
      <AgGridReact
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
  );
};
export default Table;
