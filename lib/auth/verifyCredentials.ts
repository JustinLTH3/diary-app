import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/verifyPassword";
import { authCredentialsSchema } from "@/lib/validation/auth";

export async function verifyCredentials(email: string, password: string) {
  const parsed = authCredentialsSchema.safeParse({ email, password });

  if (!parsed.success) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email,
    },
    select: {
      id: true,
      email: true,
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
    email: user.email,
  };
}
