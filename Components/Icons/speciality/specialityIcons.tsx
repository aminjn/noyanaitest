import { ReactNode } from "react";

// The speciality icon pack (2026-10): one line icon per field, drawn on a
// 24 grid, 1.6 stroke, round caps - the same weight as the site's other
// icons, so they sit in menus, cards and headers without a frame of their
// own. A speciality gets its icon by the key stored on it (backend
// Speciality.icon, set from the official list) or, failing that, by the
// words in its name (specialityIconKey below). Unknown: the stethoscope.

const P = ({ d }: { d: string }) => <path d={d} />;

export const SPECIALITY_ICONS = {
  // general practice / internal medicine
  stethoscope: (
    <>
      <P d="M6 3v5a4 4 0 0 0 8 0V3" />
      <P d="M10 12v2a5 5 0 0 0 10 0v-2" />
      <circle cx="20" cy="10" r="2" />
      <P d="M5 3h2M13 3h2" />
    </>
  ),
  heart: (
    <>
      <P d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
      <P d="M4.5 12h3.5l1.5-2.5 2 5 1.5-2.5h6.5" />
    </>
  ),
  heartPulse: (
    <>
      <P d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20Z" />
      <P d="M9 11.5h1.5l1-2 1.5 4 1-2H15" />
    </>
  ),
  brain: (
    <>
      <P d="M9.5 4.5A2.5 2.5 0 0 0 7 7a2.5 2.5 0 0 0-2 4 2.8 2.8 0 0 0 1 4.5A2.5 2.5 0 0 0 9.5 19.5c.9 0 1.7-.5 2.5-1V5.5c-.7-.6-1.6-1-2.5-1Z" />
      <P d="M14.5 4.5A2.5 2.5 0 0 1 17 7a2.5 2.5 0 0 1 2 4 2.8 2.8 0 0 1-1 4.5 2.5 2.5 0 0 1-3.5 4c-.9 0-1.7-.5-2.5-1" />
      <P d="M9 9.5c.8 0 1.5.4 2 1M15 9.5c-.8 0-1.5.4-2 1M8.5 14c.9-.2 1.8.1 2.5.8M15.5 14c-.9-.2-1.8.1-2.5.8" />
    </>
  ),
  neurosurgery: (
    <>
      <P d="M8 5.5A2.3 2.3 0 0 0 5.7 8a2.3 2.3 0 0 0-1.2 3.7A2.4 2.4 0 0 0 7 15.5c.7 0 1.4-.3 2-.8V6.3A2.6 2.6 0 0 0 8 5.5Z" />
      <P d="M13 6.3a2.6 2.6 0 0 1 3.7 1.7 2.3 2.3 0 0 1 1.2 2" />
      <P d="m13 20 7.5-7.5 1.5 1.5-7.5 7.5H13v-1.5Z" />
    </>
  ),
  eye: (
    <>
      <P d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r=".6" />
    </>
  ),
  glasses: (
    <>
      <circle cx="6.5" cy="14" r="3.5" />
      <circle cx="17.5" cy="14" r="3.5" />
      <P d="M10 14c.7-.8 3.3-.8 4 0M3 14 4.5 8h2M21 14l-1.5-6h-2" />
    </>
  ),
  ear: (
    <>
      <P d="M7 9a5 5 0 0 1 10 0c0 3-2.5 3.8-3.2 5.6-.6 1.7-.9 4.4-3.8 4.4A3 3 0 0 1 7 16" />
      <P d="M10 9.5a2 2 0 0 1 4 0c0 1.3-1.2 1.6-1.6 2.6" />
    </>
  ),
  hearing: (
    <>
      <P d="M5 9.5a5 5 0 0 1 10 0c0 3-2.5 3.8-3.2 5.6-.6 1.7-.9 4.4-3.8 4.4A3 3 0 0 1 5 16.5" />
      <P d="M18 7.5a6 6 0 0 1 0 6M20.5 5a9.5 9.5 0 0 1 0 11" />
    </>
  ),
  nose: (
    <>
      <P d="M12 3.5c-.5 3-2 6-3.8 8.8A3 3 0 0 0 10.7 17H12" />
      <P d="M9 17.5c.5.6 1.5 1 3 1s2.5-.4 3-1M15 17a2 2 0 0 0 0-4" />
      <P d="M6 20.5h12" />
    </>
  ),
  tooth: (
    <>
      <P d="M7.5 3.5c1.6 0 2.8.8 4.5.8s2.9-.8 4.5-.8c2.4 0 3.5 2 3.5 4.3 0 3-1.4 4.4-1.9 7.5-.4 2.5-.9 5.2-2.4 5.2-1.6 0-1.6-4.5-3.7-4.5s-2.1 4.5-3.7 4.5c-1.5 0-2-2.7-2.4-5.2C5.4 12.2 4 10.8 4 7.8 4 5.5 5.1 3.5 7.5 3.5Z" />
    </>
  ),
  braces: (
    <>
      <P d="M7 5.5c1.4 0 2.4.7 3.9.7S13.4 5.5 15 5.5c2.1 0 3 1.8 3 3.8 0 2.7-1.2 3.9-1.7 6.6-.3 2.2-.8 4.6-2.1 4.6-1.4 0-1.4-4-3.3-4s-1.9 4-3.3 4c-1.3 0-1.8-2.4-2.1-4.6C5 13.2 4 12 4 9.3c0-2 .9-3.8 3-3.8Z" />
      <P d="M4.5 10.5h15M8 9v3M12 9v3M16 9v3" />
    </>
  ),
  child: (
    <>
      <circle cx="12" cy="6" r="2.8" />
      <P d="M8 21v-5.5L6 12.5M16 21v-5.5l2-3M8 15.5h8M9 10.5h6l1 5H8l1-5Z" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="11" r="7.5" />
      <P d="M9.5 10h.01M14.5 10h.01M10 14c1.2 1 2.8 1 4 0M12 3.5c-1 1-1 2 0 2.5" />
    </>
  ),
  pregnancy: (
    <>
      <circle cx="11" cy="4.5" r="2" />
      <P d="M9.5 21v-4.5L8 11.5c0-2 1.2-4 3.4-4 1.5 0 2.4 1.2 2.6 2.5A4.5 4.5 0 0 1 15 17h-2.5V21" />
    </>
  ),
  female: (
    <>
      <circle cx="12" cy="9" r="5.5" />
      <P d="M12 14.5V21M9 18h6" />
    </>
  ),
  male: (
    <>
      <circle cx="10" cy="14" r="5.5" />
      <P d="m14 10 6-6M15.5 4H20v4.5" />
    </>
  ),
  bone: (
    <>
      <P d="M7.6 16.4 16.4 7.6a2.5 2.5 0 1 1 3.5-.5 2.5 2.5 0 1 1-.5 3.5l-8.8 8.8a2.5 2.5 0 1 1-3.5.5 2.5 2.5 0 1 1 .5-3.5Z" />
    </>
  ),
  spine: (
    <>
      <rect x="9" y="2.5" width="6" height="3.5" rx="1.2" />
      <rect x="9" y="7.5" width="6" height="3.5" rx="1.2" />
      <rect x="9" y="12.5" width="6" height="3.5" rx="1.2" />
      <rect x="9.5" y="17.5" width="5" height="3.5" rx="1.2" />
      <P d="M6 4.5h3M15 9.5h3M6 14.5h3" />
    </>
  ),
  joint: (
    <>
      <P d="M9 3v6a3 3 0 0 0 6 0V3" />
      <P d="M9 21v-6a3 3 0 0 1 6 0v6" />
      <P d="M6 12h2M16 12h2" />
    </>
  ),
  hand: (
    <>
      <P d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10.5V4a1.5 1.5 0 0 1 3 0v6.5M14 10.5V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-5-2.7L3 15.5a1.5 1.5 0 0 1 2.5-1.7L8 16" />
    </>
  ),
  kidney: (
    <>
      <P d="M9 4C5.5 4 4 7 4 11s1.5 8.5 5 8.5c2.5 0 3-2.5 2-4.5-.8-1.5-.8-3.5 0-5 1-2 .5-6-2-6Z" />
      <P d="M15 4c3.5 0 5 3 5 7s-1.5 8.5-5 8.5c-2.5 0-3-2.5-2-4.5.8-1.5.8-3.5 0-5-1-2-.5-6 2-6Z" />
    </>
  ),
  bladder: (
    <>
      <P d="M7 4.5c0 2-2.5 3.5-2.5 7.5a7.5 7.5 0 0 0 15 0c0-4-2.5-5.5-2.5-7.5" />
      <P d="M10 19.5V22M14 19.5V22M9.5 12.5h5" />
    </>
  ),
  lungs: (
    <>
      <P d="M12 3v8M12 11c-1.2 1-2 1.5-3 2" />
      <P d="M12 11c1.2 1 2 1.5 3 2" />
      <P d="M8.5 7.5c-3 .5-5 4.5-5 9.5 0 2.2 1.3 3.5 3.3 3.5 2.4 0 3.2-1.8 3.2-4V9c0-1-.7-1.6-1.5-1.5Z" />
      <P d="M15.5 7.5c3 .5 5 4.5 5 9.5 0 2.2-1.3 3.5-3.3 3.5-2.4 0-3.2-1.8-3.2-4V9c0-1 .7-1.6 1.5-1.5Z" />
    </>
  ),
  stomach: (
    <>
      <P d="M9 3v4.5c0 1.5-1 2-2.5 2.5A4.5 4.5 0 0 0 4 14.5a6.5 6.5 0 0 0 11 4.6c1.2-1.2 2-2.5 3.5-2.5H20" />
      <P d="M15 3v5a2.5 2.5 0 0 0 5 0" />
    </>
  ),
  liver: (
    <>
      <P d="M3.5 9c0-2.5 2.5-4 6-4 4.5 0 11 .5 11 3.5 0 4.5-6.5 10.5-11 10.5C6 19 3.5 14 3.5 9Z" />
      <P d="M12 5v6.5M12 11.5c-1.5 1-2.5 2.5-3 4.5" />
    </>
  ),
  skin: (
    <>
      <P d="M3 8c3 1.5 6 1.5 9 0s6-1.5 9 0M3 13c3 1.5 6 1.5 9 0s6-1.5 9 0" />
      <P d="M3 18c3 1.5 6 1.5 9 0s6-1.5 9 0" />
      <circle cx="8" cy="10.5" r=".5" />
      <circle cx="16" cy="15.5" r=".5" />
    </>
  ),
  sparkle: (
    <>
      <P d="M12 3c.6 4 1.9 5.4 6 6-4.1.6-5.4 2-6 6-.6-4-1.9-5.4-6-6 4.1-.6 5.4-2 6-6Z" />
      <P d="M18.5 15.5c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5Z" />
    </>
  ),
  face: (
    <>
      <P d="M12 3.5c4 0 6.5 3 6.5 7.3 0 5.2-3.6 9.7-6.5 9.7s-6.5-4.5-6.5-9.7c0-4.3 2.5-7.3 6.5-7.3Z" />
      <P d="M9.5 10h.01M14.5 10h.01M12 11v2.5h-1M10 16c1.2.7 2.8.7 4 0" />
    </>
  ),
  mind: (
    <>
      <P d="M14.5 21v-3h2a2 2 0 0 0 2-2v-2.5l1.5-.5-1.5-3A7 7 0 1 0 7 15.5V21" />
      <P d="M10 8.5a2 2 0 1 1 2.5 2c-.5.2-.5.8-.5 1.5" />
      <P d="M12 14.5h.01" />
    </>
  ),
  psychology: (
    <>
      <P d="M14.5 21v-3h2a2 2 0 0 0 2-2v-2.5l1.5-.5-1.5-3A7 7 0 1 0 7 15.5V21" />
      <P d="M12.5 7c-2 0-3 1.5-3 3s1.5 2.5 3 2.5c0-2 .5-4 2.5-5-.7-.3-1.6-.5-2.5-.5Z" />
    </>
  ),
  scalpel: (
    <>
      <P d="M14.5 3.5 21 10l-9.5 9.5-6-.5-.5-6L14.5 3.5Z" />
      <P d="m11 13 3.5 3.5M3 21l2.5-2.5" />
    </>
  ),
  stitch: (
    <>
      <P d="M4 20 20 4" />
      <P d="m7 13 4 4M10 10l4 4M13 7l4 4" />
    </>
  ),
  mask: (
    <>
      <P d="M5 8.5c2-1.5 4.5-2 7-2s5 .5 7 2V12c0 4-3 6.5-7 6.5S5 16 5 12V8.5Z" />
      <P d="M5 9.5H3.5a1.5 1.5 0 0 0 0 3H5M19 9.5h1.5a1.5 1.5 0 0 1 0 3H19M9 11.5h6M9.5 14.5h5" />
    </>
  ),
  xray: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <P d="M12 6.5v11M8.5 8.5h7M8 11h8M8.5 13.5h7M9.5 16h5" />
    </>
  ),
  radiation: (
    <>
      <circle cx="12" cy="12" r="1.8" />
      <P d="M12 3.5a8.5 8.5 0 0 1 7.4 4.3L14 10.9M4.6 7.8A8.5 8.5 0 0 1 12 3.5M4.6 7.8 10 10.9M10.5 14.6l-3.1 5.4a8.5 8.5 0 0 0 9.2 0l-3.1-5.4" />
    </>
  ),
  ribbon: (
    <>
      <P d="M12 3.5c-2 0-3.5 1.5-3.5 3.5 0 2.7 3 6 3.5 6.5.5-.5 3.5-3.8 3.5-6.5 0-2-1.5-3.5-3.5-3.5Z" />
      <P d="m12 13.5-5 7 2-.2 1 1.7 2-4.5M12 13.5l5 7-2-.2-1 1.7-2-4.5" />
    </>
  ),
  microscope: (
    <>
      <P d="M6 21h12M9 21v-2.5M10 3.5l4 1.5-3 8-4-1.5 3-8ZM8.5 13l-1 2.5" />
      <P d="M16 9.5a5.5 5.5 0 0 1-2.5 9" />
    </>
  ),
  dna: (
    <>
      <P d="M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />
      <P d="M9 6h6M9.5 18h5M10.5 12h3" />
    </>
  ),
  virus: (
    <>
      <circle cx="12" cy="12" r="5" />
      <P d="M12 4.5V7M12 17v2.5M4.5 12H7M17 12h2.5M6.7 6.7l1.8 1.8M15.5 15.5l1.8 1.8M6.7 17.3l1.8-1.8M15.5 8.5l1.8-1.8" />
      <circle cx="10.5" cy="11" r=".6" />
      <circle cx="13.5" cy="13" r=".6" />
    </>
  ),
  drop: (
    <>
      <P d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />
      <P d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  gland: (
    <>
      <P d="M12 6c-1 0-1.5 1-1.5 2v1.5C9 8 4.5 7.5 4.5 12c0 3 2.5 4.5 5 3.5 1-.4 1.5-1.2 2.5-1.2s1.5.8 2.5 1.2c2.5 1 5-.5 5-3.5 0-4.5-4.5-4-6-2.5V8c0-1-.5-2-1.5-2Z" />
      <P d="M12 3v3M12 14.3V21" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="9" r="2" />
      <P d="M12 7a2.5 2.5 0 1 1 2.5-2.5M14 9a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1-2-1M10 9a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 2-1M12 7a2.5 2.5 0 1 0-2.5-2.5" />
      <P d="M12 13v8M12 17c-1.5-1.5-3.5-1.5-4.5-1M12 18c1.5-1.5 3.5-1.5 4.5-1" />
    </>
  ),
  siren: (
    <>
      <P d="M7 18v-5a5 5 0 0 1 10 0v5" />
      <P d="M5 18h14v2.5H5zM12 3v2M4.5 6.5 6 8M19.5 6.5 18 8M2.5 13H4M20 13h1.5" />
    </>
  ),
  elderly: (
    <>
      <circle cx="10" cy="4.5" r="2" />
      <P d="M9 21v-5l-2-2.5 1.5-5.5c1.5 0 3 1 3.5 2.5l2 1.5M11 15.5l1.5 5.5M15.5 12v9" />
    </>
  ),
  moon: (
    <>
      <P d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      <P d="M16 4.5h3l-3 3.5h3" />
    </>
  ),
  leaf: (
    <>
      <P d="M5 19C5 10 10 5 20 4c-.5 9-5 15-12 15H5Z" />
      <P d="M5 19 13 11" />
    </>
  ),
  running: (
    <>
      <circle cx="15" cy="4.5" r="2" />
      <P d="m6 21 3.5-5 3 1.5 1-5 3 2.5H20M9 11l2.5-3.5 4 1.5M4 13l3-1" />
    </>
  ),
  apple: (
    <>
      <P d="M12 7.5c-1.5-1-3-1.5-4.5-1C5 7 4 9.5 4 12c0 4.5 3 8.5 5.5 8.5 1 0 1.5-.5 2.5-.5s1.5.5 2.5.5c2.5 0 5.5-4 5.5-8.5 0-2.5-1-5-3.5-5.5-1.5-.5-3 0-4.5 1Z" />
      <P d="M12 7.5c0-2 1-3.5 3-4" />
    </>
  ),
  physio: (
    <>
      <circle cx="12" cy="4" r="2" />
      <P d="M4 9.5 12 8l8 1.5M12 8v6l-3.5 7M12 14l3.5 7" />
    </>
  ),
  speech: (
    <>
      <P d="M4 5.5h16v10H10l-4.5 4v-4H4v-10Z" />
      <P d="M8 9.5h8M8 12h5" />
    </>
  ),
  nurse: (
    <>
      <P d="M5 9.5c0-3 3-5 7-5s7 2 7 5H5Z" />
      <P d="M12 5.5v3M10.5 7h3M6.5 9.5a5.5 5.5 0 0 0 11 0M7 21c.5-3 2.5-4.5 5-4.5s4.5 1.5 5 4.5" />
    </>
  ),
  midwife: (
    <>
      <P d="M3 15.5c2.5 0 4 1.5 6.5 1.5h4a1.5 1.5 0 0 0 0-3H10M3 20.5h2c2 0 3.5 1 6 1 2 0 4-1 9-4.5a1.5 1.5 0 0 0-2-2.2l-3.5 2" />
      <circle cx="13" cy="6.5" r="3.5" />
    </>
  ),
  pill: (
    <>
      <P d="M9 20.5a5 5 0 0 1-3.5-8.5l7-7A5 5 0 0 1 19.5 12l-7 7A5 5 0 0 1 9 20.5Z" />
      <P d="m9 9 6 6" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <P d="M9 7.5V5.5h6v2M12 11v5M9.5 13.5h5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9.5" r="2.3" />
      <P d="M3.5 19.5c.4-3.3 2.6-5.5 5.5-5.5s5.1 2.2 5.5 5.5M15 14.2c2.8-.3 4.9 1.5 5.5 4.8" />
    </>
  ),
  magnifier: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <P d="m15 15 5.5 5.5M8 10.5h5M10.5 8v5" />
    </>
  ),
  atom: (
    <>
      <circle cx="12" cy="12" r="1.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9" ry="3.8" transform="rotate(-60 12 12)" />
    </>
  ),
  bed: (
    <>
      <P d="M3 18.5V6M3 14h18v4.5M21 14v-2a3 3 0 0 0-3-3h-7v5" />
      <circle cx="7" cy="11" r="2" />
    </>
  ),
  breast: (
    <>
      <P d="M3.5 6c1.5 5 4 8 7 8.5M20.5 6c-1.5 5-4 8-7 8.5" />
      <circle cx="9" cy="14" r="1" />
      <circle cx="15" cy="14" r="1" />
      <P d="M12 17v4" />
    </>
  ),
  transplant: (
    <>
      <P d="M12 20s-6-3.7-6-8.2A3.5 3.5 0 0 1 12 9.7a3.5 3.5 0 0 1 6 2.1c0 4.5-6 8.2-6 8.2Z" />
      <P d="M12 3v4M10 5h4M4 6l2 1.5M20 6l-2 1.5" />
    </>
  ),
  scale: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <P d="M8.5 9a5 5 0 0 1 7 0L13 12" />
      <P d="M8 16h8" />
    </>
  ),
  pain: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <P d="m13 6-3 6.5h4L11 18" />
    </>
  ),
  addiction: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <P d="m6 6 12 12M8.5 14.5h5" />
    </>
  ),
  diabetes: (
    <>
      <P d="M12 3.5s5.5 5.8 5.5 9.5a5.5 5.5 0 0 1-11 0c0-3.7 5.5-9.5 5.5-9.5Z" />
      <P d="M10 13h4M12 11v4" />
    </>
  ),
  endoscope: (
    <>
      <P d="M4 4h4v4H4zM8 6h4a4 4 0 0 1 4 4v4a3 3 0 0 0 3 3h1.5" />
      <circle cx="20.5" cy="17" r="1" />
    </>
  ),
  ivf: (
    <>
      <circle cx="11" cy="12" r="6.5" />
      <circle cx="11" cy="12" r="2.2" />
      <P d="M17 6.5 21 2.5M19 6l1 1" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type SpecialityIconKey = keyof typeof SPECIALITY_ICONS;

// most specific words first: «جراحی قلب» is the heart, «قلب کودکان» too
const RULES: [SpecialityIconKey, RegExp][] = [
  ["ivf", /نازایی|ناباروری|آی\s?وی\s?اف|ivf|infertil/i],
  ["transplant", /پیوند|transplant/i],
  ["diabetes", /دیابت|diabet/i],
  ["breast", /پستان|breast/i],
  ["endoscope", /آندوسکوپی|اندوسکوپی|لاپاراسکوپی|endoscop|laparoscop/i],
  ["neurosurgery", /جراحی مغز|جراحی اعصاب|neurosurg/i],
  ["heart", /قلب|cardi|heart/i],
  ["spine", /ستون فقرات|spine|spinal/i],
  ["hand", /جراحی دست|hand surg/i],
  ["joint", /روماتو|زانو|شانه|مفصل|rheumat|knee|shoulder|joint/i],
  ["brain", /مغز|اعصاب|نورولوژ|صرع|سکته|ام\s?اس|neuro|epilep|stroke/i],
  ["glasses", /بینایی|optomet/i],
  ["eye", /چشم|قرنیه|شبکیه|گلوکوم|یووئیت|ophthal|retina|cornea|glaucom/i],
  ["hearing", /شنوایی|audiol/i],
  ["ear", /گوش|حلق|بینی|اتولوژی|رینولوژی|سینوس|ent\b|otolar|otolog/i],
  ["braces", /ارتودنسی|orthodont/i],
  ["tooth", /دندان|دهان|فک|اندودانت|پریودانت|dental|dentist|endodont|periodont|prosthodont|oral/i],
  ["baby", /نوزاد|neonat/i],
  ["pregnancy", /زنان|زایمان|پریناتولوژ|obstet|gynec|perinat/i],
  ["midwife", /مامایی|midwif/i],
  ["male", /آندرولوژ|androl/i],
  ["kidney", /نفرولوژ|کلیه|nephro|kidney/i],
  ["bladder", /اورولوژ|مجاری ادرار|urolog/i],
  ["lungs", /ریه|قفسه سینه|pulmon|lung|thorac/i],
  ["liver", /کبد|صفرا|hepat|liver/i],
  ["stomach", /گوارش|کولورکتال|معده|gastro|colorect/i],
  ["sparkle", /زیبایی|لیزر|cosmetic|aesthet|laser/i],
  ["face", /پلاستیک|ترمیمی|سوختگی|صورت|plastic|facial/i],
  ["skin", /پوست|مو\b|derma|skin/i],
  ["psychology", /روانشناس|روان‌درمانی|روان درمانی|psycholog|psychother/i],
  ["addiction", /اعتیاد|addict/i],
  ["mind", /روان|psychiat/i],
  ["pain", /درد|pain/i],
  ["mask", /بیهوشی|مراقبت‌های ویژه|مراقبت های ویژه|anesth|intensive|icu/i],
  ["radiation", /رادیوتراپی|radiother|radiation/i],
  ["ribbon", /سرطان|انکولوژ|تومور|oncol|cancer|tumou?r/i],
  ["xray", /رادیولوژ|تصویربرداری|سونوگرافی|radiolog|imaging/i],
  ["atom", /هسته‌ای|هسته ای|nuclear/i],
  ["microscope", /پاتولوژ|آزمایشگاه|patholog/i],
  ["dna", /ژنتیک|genet/i],
  ["virus", /عفونی|infect/i],
  ["drop", /خون|هماتولوژ|hemat/i],
  ["gland", /غدد|متابولیسم|تیروئید|endocrin|thyroid/i],
  ["flower", /آلرژی|ایمونولوژ|allerg|immunol/i],
  ["siren", /اورژانس|emergenc|trauma/i],
  ["elderly", /سالمند|geriat/i],
  ["moon", /خواب|sleep/i],
  ["leaf", /طب سنتی|طب ایرانی|سنتی|persian med|tradition/i],
  ["running", /ورزشی|sport/i],
  ["apple", /تغذیه|nutrition|diet/i],
  ["physio", /فیزیوتراپی|توانبخشی|کاردرمانی|physiother|rehab|occupational therap/i],
  ["speech", /گفتاردرمانی|گفتار درمانی|speech/i],
  ["nurse", /پرستار|nurs/i],
  ["briefcase", /طب کار|occupational med/i],
  ["people", /پزشکی اجتماعی|community/i],
  ["magnifier", /قانونی|forensic/i],
  ["child", /کودک|اطفال|pediat|paediat|child/i],
  ["bone", /ارتوپد|استخوان|orthop|bone/i],
  ["scalpel", /جراح|surg/i],
  ["stethoscope", /داخلی|عمومی|internal|general/i],
];

export const specialityIconKey = (node?: { icon?: unknown; name?: unknown; slug?: unknown } | null): SpecialityIconKey => {
  if (node && typeof node.icon === "string" && node.icon in SPECIALITY_ICONS) return node.icon as SpecialityIconKey;
  const text = [node?.name, node?.slug].filter((v): v is string => typeof v === "string").join(" ");
  for (const [key, re] of RULES) if (re.test(text)) return key;
  return "stethoscope";
};
