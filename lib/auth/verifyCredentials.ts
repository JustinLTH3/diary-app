import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/verifyPassword";
import { authCredentialsSchema } from "@/lib/validation/auth";

export async function verifyCredentials(username: string, password: string) {
  const parsed = authCredentialsSchema.safeParse({ username, password });

  if (!parsed.success) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      username: parsed.data.username,
    },
    select: {
      id: true,
      username: true,
      passwordHash: true,
    },
  });

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(user.passwordHash, parsed.data.password);

  if (!isValidPassword) {
    return null;
  }

  return {
    id: user.id,
    username: user.username,
  };
}
