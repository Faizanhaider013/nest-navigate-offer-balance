/** Original game illustration; not an official Nest Navigate brand asset. */
export function HomeScene({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={compact ? "home-scene is-compact" : "home-scene"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 520 370" fill="none" focusable="false">
        <ellipse cx="262" cy="192" rx="215" ry="163" fill="#eaf0ff" />
        <circle cx="405" cy="76" r="26" fill="#f7d996" />
        <path
          d="M54 99h80c0-18-20-23-29-13-7-29-45-23-45 2-12-1-18 11-6 11ZM359 133h83c0-18-22-23-31-11-11-24-43-15-43 3-10-2-16 8-9 8Z"
          fill="white"
        />
        <ellipse cx="270" cy="329" rx="204" ry="20" fill="#d8e2df" />
        <path
          d="M80 310V200m0 54-20-18m20 2 18-19"
          stroke="#719783"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path d="M80 142c-40 0-62 100 0 107 63-7 40-107 0-107" fill="#adcbb9" />
        <path d="M438 312v-93" stroke="#719783" strokeWidth="6" />
        <ellipse cx="438" cy="216" rx="26" ry="47" fill="#bdd3bc" />
        <path d="M146 170 276 74l127 96v149H146Z" fill="#f9f0dd" />
        <path d="m276 74 127 96v149h-45V166Z" fill="#ecdfc4" />
        <path
          d="M140 175 275 72l134 102"
          stroke="#5269b9"
          strokeWidth="19"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M338 113V67h29v69" fill="#7e92cf" />
        <path
          d="M334 66h37"
          stroke="#5269b9"
          strokeWidth="7"
          strokeLinecap="round"
        />
        <path
          d="M139 320h271"
          stroke="#cbbca4"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <rect x="253" y="232" width="48" height="88" rx="6" fill="#7085ce" />
        <rect x="260" y="241" width="34" height="37" rx="3" fill="#dae6ff" />
        <circle cx="291" cy="291" r="3" fill="#ffdf9b" />
        <path d="M246 328h63l16 19h-95Z" fill="#c5cfdc" />
        <g fill="#d6e7f2" stroke="#fffdf5" strokeWidth="7">
          <rect x="175" y="196" width="47" height="52" rx="3" />
          <rect x="327" y="196" width="47" height="52" rx="3" />
          <path d="M254 160a22 22 0 0 1 44 0v21h-44Z" />
        </g>
        <path
          d="M198 197v49m-22-24h44m130-25v49m-22-24h44m-98-78v36"
          stroke="#fffdf5"
          strokeWidth="5"
        />
        <path
          d="M168 257h61m91 0h61"
          stroke="#b7c8a6"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <g fill="#829e80">
          <circle cx="171" cy="301" r="17" />
          <circle cx="193" cy="303" r="20" />
          <circle cx="362" cy="302" r="18" />
          <circle cx="383" cy="305" r="14" />
        </g>
        <g transform="translate(76 271) rotate(-9)">
          <rect
            width="78"
            height="54"
            rx="8"
            fill="white"
            stroke="#b7c4ec"
            strokeWidth="2"
          />
          <path d="m5 7 34 25L73 7" stroke="#8296d6" strokeWidth="2" />
          <circle cx="39" cy="32" r="9" fill="#eef1ff" />
          <path d="m35 32 3 3 5-6" stroke="#5269b9" strokeWidth="2" />
        </g>
      </svg>
      {!compact && (
        <>
          <span className="scene-note scene-note-buyer">
            A little protection.
          </span>
          <span className="scene-note scene-note-seller">
            A thoughtful offer.
          </span>
          <span className="scene-caption">
            A place to start. A balance to find.
          </span>
        </>
      )}
    </div>
  );
}
