"use client";

import { useEffect } from "react";
import { startSingleSpa } from "@/mf/root-config";

export default function SingleSpaRoot() {
  useEffect(() => {
    startSingleSpa();
  }, []);

  return null;
}
