import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  // SSR-safe: initial render must match server (false). Real value syncs
  // post-hydration in useEffect — reading window during render causes
  // hydration mismatch when client viewport is mobile.
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    onChange(); // sync real value after mount (post-hydration re-render)
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
