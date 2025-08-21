export default function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="100%"
      height="100%"
      viewBox="0 0 32 32"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <circle cx={17} cy={15} r={1}></circle>
        <circle cx={16} cy={16} r={6}></circle>
        <path d="M2 16S7 6 16 6s14 10 14 10s-5 10-14 10S2 16 2 16"></path>
      </g>
    </svg>
  );
}
