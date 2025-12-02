"use client";

import { useEffect, useState } from "react";
import DesktopHome from "@/components/ui/DesktopHome";
import MobileHX2Home from "@/components/ui/MobileHX2Home";

export default function HomeSwitcher() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth <= 768);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  return isMobile ? <MobileHX2Home /> : <DesktopHome />;
}
