
"use client";
import { useEffect, useState } from "react";
export default function CookieBanner(){
  const [v,setV]=useState(false);
  useEffect(()=>{ setV(localStorage.getItem("cookie-consent")!=="accepted"); },[]);
  if(!v) return null;
  return (
    <div className="fixed bottom-4 inset-x-0 flex justify-center z-50">
      <div className="max-w-3xl bg-white shadow border rounded-xl p-4 mx-4">
        <p className="text-sm">We use essential cookies for security and basic analytics.</p>
        <div className="mt-3 flex gap-3">
          <button className="px-3 py-1 rounded-md bg-indigo-600 text-white" onClick={()=>{localStorage.setItem("cookie-consent","accepted");setV(false);}}>Accept</button>
          <a className="px-3 py-1 rounded-md border" href="/privacy">Learn more</a>
        </div>
      </div>
    </div>
  );
}
