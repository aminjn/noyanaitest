export const sizes = [12, 14, 16, 18, 20, 24, 32, 48] as const;

export type Size = (typeof sizes)[number];

const Colors = {
  whiteCol: "var(--white)",
  blackCol: "var(--black)",

  primary1Col: "var(--primary1)",
  primary2Col: "var(--primary2)",
  primary3Col: "var(--primary3)",
  primary4Col: "var(--primary4)",
  primary5Col: "var(--primary5)",
  primary6Col: "var(--primary6)",
  primary7Col: "var(--primary7)",
  primary8Col: "var(--primary8)",
  primary9Col: "var(--primary9)",
  primary10Col: "var(--primary10)",

  secondary1Col: "var(--secondary1)",
  secondary2Col: "var(--secondary2)",
  secondary3Col: "var(--secondary3)",
  secondary4Col: "var(--secondary4)",
  secondary5Col: "var(--secondary5)",
  secondary6Col: "var(--secondary6)",
  secondary7Col: "var(--secondary7)",
  secondary8Col: "var(--secondary8)",
  secondary9Col: "var(--secondary9)",
  secondary10Col: "var(--secondary10)",

  gray1Col: "var(--gray1)",
  gray2Col: "var(--gray2)",
  gray3Col: "var(--gray3)",
  gray4Col: "var(--gray4)",
  gray5Col: "var(--gray5)",
  gray6Col: "var(--gray6)",
  gray7Col: "var(--gray7)",
  gray8Col: "var(--gray8)",
  gray9Col: "var(--gray9)",
  gray10Col: "var(--gray10)",
  gray11Col: "var(--gray11)",
  gray12Col: "var(--gray12)",
  gray13Col: "var(--gray13)",

  errorS4Col: "var(--errorS4)",
  errorS3Col: "var(--errorS3)",
  errorS2Col: "var(--errorS2)",
  errorS1Col: "var(--errorS1)",
  errorCol: "var(--error)",
  errorT4Col: "var(--errorT4)",
  errorT3Col: "var(--errorT3)",
  errorT2Col: "var(--errorT2)",
  errorT1Col: "var(--errorT1)",

  successS4Col: "var(--successS4)",
  successS3Col: "var(--successS3)",
  successS2Col: "var(--successS2)",
  successS1Col: "var(--successS1)",
  successCol: "var(--success)",
  successT4Col: "var(--successT4)",
  successT3Col: "var(--successT3)",
  successT2Col: "var(--successT2)",
  successT1Col: "var(--successT1)",

  warningS4Col: "var(--warningS4)",
  warningS3Col: "var(--warningS3)",
  warningS2Col: "var(--warningS2)",
  warningS1Col: "var(--warningS1)",
  warningCol: "var(--warning)",
  warningT4Col: "var(--warningT4)",
  warningT3Col: "var(--warningT3)",
  warningT2Col: "var(--warningT2)",
  warningT1Col: "var(--warningT1)",

  infoS4Col: "var(--infoS4)",
  infoS3Col: "var(--infoS3)",
  infoS2Col: "var(--infoS2)",
  infoS1Col: "var(--infoS1)",
  infoCol: "var(--info)",
  infoT4Col: "var(--infoT4)",
  infoT3Col: "var(--infoT3)",
  infoT2Col: "var(--infoT2)",
  infoT1Col: "var(--infoT1)",
} as const;

export const colors = Object.keys(Colors).map(
  (color) => Colors[color as keyof typeof Colors],
);

export type Color = (typeof Colors)[keyof typeof Colors];

export const blockNames = [
  "p",
  "ol",
  "h",
  "img",
  "li",
  "ul",
  "vid",
  "ads",
] as const;

export type BlockName = (typeof blockNames)[number];

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export const alignments = ["left", "center", "right", "justify"] as const;

export type Alignment = (typeof alignments)[number];

export const lineHeights = [
  "50%",
  "60%",
  "70%",
  "80%",
  "90%",
  "100%",
  "110%",
  "120%",
  "130%",
  "140%",
  "150%",
  "160%",
  "170%",
  "180%",
  "190%",
  "200%",
] as const;

export type LineHeight = (typeof lineHeights)[number];
