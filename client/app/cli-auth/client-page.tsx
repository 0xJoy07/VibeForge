"use client";

import { useEffect, useState, useRef } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function CliAuthClient({
  token,
  port,
  stateParam,
}: {
  token: string;
  port: string;
  stateParam: string;
}) {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetch(`http://127.0.0.1:${port}/callback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, state: stateParam }),
    })
      .then((res) => {
        if (res.ok) setStatus("success");
        else setStatus("error");
      })
      .catch(() => setStatus("error"));
  }, [token, port, stateParam]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {status === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-[#00c97a] mb-4" />
          <h2 className="text-xl font-bold text-white">Authenticating...</h2>
          <p className="text-zinc-400 mt-2">Please wait while we connect to your terminal.</p>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircle2 className="h-16 w-16 text-[#00c97a] mb-4" />
          <h2 className="text-2xl font-bold text-white">Terminal authenticated!</h2>
          <p className="text-zinc-400 mt-2">You can safely close this tab and return to your terminal.</p>
        </>
      )}

      {status === "error" && (
        <>
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-white">Connection failed</h2>
          <p className="text-zinc-400 mt-2">
            Could not reach the CLI. Make sure you ran <code>vibeforge login</code> first.
          </p>
        </>
      )}
    </div>
  );
}
