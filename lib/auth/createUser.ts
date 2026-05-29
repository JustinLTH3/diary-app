import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/hashPassword";
import { authCredentialsSchema } from "@/lib/validation/auth";

export class DuplicateUserError extends Error {
  constructor() {
    super("A user with this email already exists.");
    this.name = "DuplicateUserError";
  }
}

export async function createUser(email: string, password: string) {
  const credentials = authCredentialsSchema.parse({ email, password });
  const passwordHash = await hashPassword(credentials.password);

  try {
    return await prisma.user.create({
      data: {
        email: credentials.email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  } catch (error) {
    if (isPrismaUniqueConstraintError(error)) {
      throw new DuplicateUserError();
    }

    throw error;
  }
}

function isPrismaUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
