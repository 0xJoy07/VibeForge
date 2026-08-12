"use server";

import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function generateTokenAction() {
  const session = await requireUser();
  if (!session.dbUser) throw new Error("Unauthorized");
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cli/token`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
  });
  if (!res.ok) throw new Error("Failed to generate token");
  const { token } = await res.json();
  
  revalidatePath("/dashboard/cli-tokens");
  return { token };
}

export async function revokeTokenAction(tokenId: string) {
  const session = await requireUser();
  if (!session.dbUser) throw new Error("Unauthorized");
  
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cli/token/${tokenId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
  });
  
  revalidatePath("/dashboard/cli-tokens");
}

export async function revokeAllTokensAction() {
  const session = await requireUser();
  if (!session.dbUser) throw new Error("Unauthorized");
  
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cli/tokens`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${session.session.access_token ?? ""}` }
  });
  
  revalidatePath("/dashboard/cli-tokens");
}
