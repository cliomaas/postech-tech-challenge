import React from "react";
import * as ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  domElementGetter: () => {
    const element = document.getElementById("mfe-dashboard");
    if (!element) {
      const fallback = document.createElement("div");
      fallback.id = "mfe-dashboard";
      document.body.appendChild(fallback);
      return fallback;
    }
    return element;
  },
  errorBoundary(err) {
    return (
      <div style={{ padding: 16 }}>
        <strong>Erro no Dashboard</strong>
        <pre>{err?.message}</pre>
      </div>
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

if (typeof window !== "undefined") {
  (window as any).mfeDashboard = { bootstrap, mount, unmount };
}
