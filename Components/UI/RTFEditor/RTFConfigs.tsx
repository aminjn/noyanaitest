export const sizes = [12, 14, 16, 18, 20, 24, 32, 48] as const;

export type Size = (typeof sizes)[number];

const Colors = {
  white: "var(--white)",
  black: "var(--black)",
  brand: "var(--brand)",
  gray100: "var(--gray100)",
  gray200: "var(--gray200)",
  gray300: "var(--gray300)",
  gray400: "var(--gray400)",
  gray500: "var(--gray500)",
  gray600: "var(--gray600)",
  gray700: "var(--gray700)",
  gray800: "var(--gray800)",
  gray900: "var(--gray900)",
  successLight: "var(--successLight)",
  success: "var(--success)",
  successDark: "var(--successDark)",
  infoLight: "var(--infoLight)",
  info: "var(--info)",
  infoDark: "var(--infoDark)",
  warningLight: "var(--warningLight)",
  warning: "var(--warning)",
  warningDark: "var(--warningDark)",
  errorLight: "var(--errorLight)",
  error: "var(--error)",
  errorDark: "var(--errorDark)",
} as const;

export const colors = Object.keys(Colors).map(
  (color) => Colors[color as keyof typeof Colors]
);

export type Color = (typeof Colors)[keyof typeof Colors];

export const blockNames = ["p", "ol", "h", "img", "li", "ul", "vid"] as const;

export type BlockName = (typeof blockNames)[number];

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const alignments = ["left", "center", "right", "justify"] as const;

export type Alignment = (typeof alignments)[number];
