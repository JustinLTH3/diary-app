import { z } from "zod";

export const authCredentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8),
});

export type AuthCredentials = z.infer<typeof authCredentialsSchema>;
