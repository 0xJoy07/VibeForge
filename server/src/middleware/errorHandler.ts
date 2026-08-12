import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : "An unexpected error occurred.";
  const status = (err as { status?: number }).status ?? 500;
  console.error(`[error] ${req.method} ${req.path}:`, err);
  res.status(status).json({ error: message });
}
