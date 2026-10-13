import { SPECIALITY_ICONS, specialityIconKey } from "./specialityIcons";

// one speciality's icon from the pack (specialityIcons.tsx), sized by the
// surrounding Ixon / font; decorative (the name is always next to it)
const SpecialityIcon = ({ node }: { node?: { icon?: unknown; name?: unknown; slug?: unknown } | null }) => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {SPECIALITY_ICONS[specialityIconKey(node)]}
  </svg>
);

export default SpecialityIcon;
