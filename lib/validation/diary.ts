import { z } from "zod";

import { diaryDateSchema } from "@/lib/validation/date";

export const diaryContentMaxLength = 10000;

export const diaryEntrySchema = z.object({
  date: diaryDateSchema,
  content: z.string().max(diaryContentMaxLength),
});
