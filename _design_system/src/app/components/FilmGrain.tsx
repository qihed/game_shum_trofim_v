export function FilmGrain() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] mix-blend-overlay opacity-[0.03]">
      <svg width="100%" height="100%">
        <filter id="filmGrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#filmGrain)" />
      </svg>
    </div>
  );
}
