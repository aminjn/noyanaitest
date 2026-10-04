"use client";

import useSWR from "swr";
import { API } from "@/Components/config";
import { fetcher } from "@/Components/helpers/fetcher";
import { IDoctorProfile } from "@/Components/DoctorPanel/DoctorPanelPage";
import AdminLocationTab from "../UI/AdminLocationTab";
import HandleLoading from "../UI/HandleLoading";
import List from "../UI/List";
import DataPair from "../UI/DataPair";
import { ta } from "@/Components/Admin/i18n/adminText";

type ScheduleOffice = {
  _id: string;
  name?: string;
  address?: string;
  active?: boolean;
  coordinates?: number[] | null;
  centre?: { name?: string } | null;
};

// A doctor's location is their office's (2026-10): the backend derives the
// profile's point and province / city / district from the first active
// office with a pin (Lib/doctorLocation.ts), so here they are shown, not
// typed. A doctor with no office pin yet (an old record) still gets the
// shared pin editor.
const DoctorProfileLocationTab = ({
  mutate,
  node,
}: {
  node: IDoctorProfile;
  mutate: () => unknown;
}) => {
  const { data, error } = useSWR<{ offices?: ScheduleOffice[] }>(
    `${API}/admin/doctorprofile/${node._id}/schedule`,
    (url: string) => fetcher({ url }).then((res) => res?.data?.data),
  );
  const offices = (Array.isArray(data?.offices) ? data.offices : []).filter(Boolean);
  const pinned = offices.filter((o) => Array.isArray(o.coordinates) && o.coordinates.length >= 2);

  return (
    <HandleLoading data={!!data} error={error}>
      {pinned.length ? (
        <List>
          <p>
            {ta(
              "موقعیت پزشک از مطب‌هایش می‌آید: نقطه، استان، شهر و محله‌ی پروفایل از اولین مطب فعال روی نقشه گرفته می‌شود. مطب‌ها را پزشک در پنل خودش ویرایش می‌کند.",
            )}
          </p>
          {offices.map((office) => (
            <DataPair
              key={office._id}
              title={`${office.name || ta("مطب")}${office.centre?.name ? ` (${office.centre.name})` : ""}${office.active ? "" : ` · ${ta("غیرفعال")}`}`}
              value={
                office.address ||
                (Array.isArray(office.coordinates) ? ta("روی نقشه ثبت شده") : ta("بدون موقعیت"))
              }
            />
          ))}
        </List>
      ) : (
        <AdminLocationTab
          path={`${API}/auto/doctorprofile/${node._id}`}
          node={node as never}
          mutate={mutate}
          hint={ta(
            "این پزشک هنوز مطبی روی نقشه ندارد؛ تا آن موقع محل را این‌جا انتخاب کنید. با ثبت اولین مطب، موقعیت از مطب گرفته می‌شود.",
          )}
        />
      )}
    </HandleLoading>
  );
};

export default DoctorProfileLocationTab;
