"use client";

import { useEffect, useState } from "react";
import { Laptop, Terminal, Clock } from "lucide-react";
import { formatDistanceToNow, differenceInMinutes } from "date-fns";

type DeviceSession = {
  id: string;
  userId: string;
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  type: string;
  lastActive: string;
  createdAt: string;
};

export function ActiveDevices({ token }: { token: string }) {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    console.log('token:', token);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [token]);

  const revokeSession = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sessions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <Laptop className="w-5 h-5 text-zinc-400" />
          <h3 className="font-medium text-white">Active Devices</h3>
        </div>
        <div className="divide-y divide-white/5 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-full border border-white/10"></div>
                <div>
                  <div className="h-4 w-32 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 w-48 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
        <Laptop className="w-5 h-5 text-zinc-400" />
        <h3 className="font-medium text-white">Active Devices</h3>
      </div>
      
      {sessions.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-zinc-500">
          No active sessions found
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {sessions.map(session => {
            const isActive = differenceInMinutes(new Date(), new Date(session.lastActive)) < 5;
            const Icon = session.type === 'cli' ? Terminal : Laptop;
            
            return (
              <div key={session.id} className="px-6 py-4 flex items-center justify-between group transition-colors hover:bg-white/[0.02]">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                    <Icon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">
                        {session.type === 'cli' ? 'CLI Terminal' : `${session.browser} on ${session.os}`}
                      </p>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-semibold bg-[#00c97a]/20 text-[#00c97a] border border-[#00c97a]/30">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <span>{session.ip}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-700"></span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(session.lastActive))} ago</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => revokeSession(session.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md border border-red-400/20"
                >
                  Revoke
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
