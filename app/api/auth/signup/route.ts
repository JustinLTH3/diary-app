import { ZodError } from "zod";

import { createUser, DuplicateUserError } from "@/lib/auth/createUser";
import { authCredentialsSchema } from "@/lib/validation/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const credentials = authCredentialsSchema.parse(body);
    const user = await createUser(credentials.email, credentials.password);

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return Response.json({ error: "Invalid signup credentials." }, { status: 400 });
    }

    if (error instanceof DuplicateUserError) {
      return Response.json({ error: "A user with this email already exists." }, { status: 409 });
    }

    return Response.json({ error: "Unable to create user." }, { status: 500 });
  }
}
