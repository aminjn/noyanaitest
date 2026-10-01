import PointPickerCore, {
  AddressComponents,
  asPoint,
  PointPickerTexts,
} from "@/Components/Map/PointPickerCore";
import { adminIntlTag, ta } from "@/Components/Admin/i18n/adminText";

// The location picker of the admin panel (clinic, hospital, para clinic,
// pharmacy, insurance, doctor profile...): place search, a click on the
// map, "my location" or typed coordinates, and the chosen point's address
// (NexaMap) under the map. The map container always has a height, and the
// inputs work even when the map tiles can't be loaded. The panels use its
// public counterpart, Components/Map/LocationPicker.
const PointPicker = ({
  defaultValue,
  onChange,
  onAddress,
  currentAddress,
  onUseAddress,
}: {
  // [lng, lat], GeoJSON order
  defaultValue?: [number, number];
  onChange?: (e: [number, number]) => unknown;
  // the reverse-geocoded address of a point the admin just chose, so a
  // form can fill its address field
  onAddress?: (address: string, components: AddressComponents) => unknown;
  // with onUseAddress: fills an empty address, else offers "use this address"
  currentAddress?: string;
  onUseAddress?: (address: string, components: AddressComponents) => unknown;
}) => {
  const texts: PointPickerTexts = {
    searchPlaceholder: ta("جستجوی آدرس یا مکان"),
    noResults: ta("نتیجه‌ای پیدا نشد"),
    searchError: ta("جستجوی نقشه در دسترس نیست"),
    myLocation: ta("موقعیت من"),
    locationError: ta("موقعیت شما پیدا نشد؛ دسترسی موقعیت مکانی مرورگر را بررسی کنید."),
    locationUnsupported: ta("مرورگر شما موقعیت مکانی را پشتیبانی نمی‌کند"),
    addressTitle: ta("آدرس این نقطه"),
    addressLoading: ta("در حال یافتن آدرس…"),
    addressUnavailable: ta("آدرسی برای این نقطه پیدا نشد"),
    trafficZone: ta("محدوده ترافیکی"),
    useThisAddress: ta("استفاده از این آدرس"),
    latitude: ta("عرض جغرافیایی"),
    longitude: ta("طول جغرافیایی"),
  };
  const saved = !!asPoint(defaultValue);
  return (
    <PointPickerCore
      defaultValue={defaultValue}
      onChange={onChange}
      onAddress={onAddress}
      currentAddress={currentAddress}
      onUseAddress={onUseAddress}
      texts={texts}
      locale={adminIntlTag()}
      hint={
        saved
          ? ta("روی نقشه کلیک کنید یا مختصات را وارد کنید، سپس تایید را بزنید.")
          : ta("هنوز موقعیتی ثبت نشده است. روی نقشه کلیک کنید یا مختصات را وارد کنید.")
      }
    />
  );
};

export default PointPicker;
