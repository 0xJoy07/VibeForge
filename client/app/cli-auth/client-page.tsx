"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

export default function CliAuthClient({
  token,
  port,
  stateParam,
}: {
  token: string;
  port: string;
  stateParam: string;
}) {
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    window.location.href = `http://127.0.0.1:${port}/callback?token=${token}&state=${stateParam}`;
  }, [token, port, stateParam]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-[#00c97a] mb-4" />
      <h2 className="text-xl font-bold text-white">Authenticating...</h2>
      <p className="text-zinc-400 mt-2">Connecting to your local terminal.</p>
    </div>
  );
}
