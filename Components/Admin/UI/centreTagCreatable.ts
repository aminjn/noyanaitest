import { NodesSelectorCreatable } from "@/Components/UI/NodesSelector";
import { isRoundTheClockText } from "@/Components/OpeningHours/openingHours";
import { ta } from "@/Components/Admin/i18n/adminText";

// The "+ create" of a centre's tags (clinic, hospital, lab), 2026-10: a tag
// that only says «شبانه‌روزی» / "24 ساعته" is not made - round the clock is
// the weekly opening hours' switch (the backend refuses it too,
// noRoundTheClockTagPlugin).
export const centreTagCreatable = (path: string): NodesSelectorCreatable => ({
  path,
  refuse: (input) =>
    isRoundTheClockText(input)
      ? ta("برچسب شبانه‌روزی لازم نیست؛ در «ساعات کاری هفتگی» کلید شبانه‌روزی را روشن کنید")
      : null,
});
