"use client";
import { ReactNode, useEffect } from "react";

export default function Modal({ open, onClose, children }:{ open:boolean; onClose:()=>void; children:ReactNode }){
  useEffect(()=>{
    const onKey = (e:KeyboardEvent)=>{ if(e.key==="Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return ()=>window.removeEventListener("keydown", onKey);
  },[onClose]);
  if(!open) return null;
  return (
    <div aria-modal role="dialog" className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-surface-100/80 border border-white/10 p-4" onClick={(e)=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
