import { z } from "zod";

import { parseDiaryDate } from "@/lib/dates/parseDiaryDate";

export const diaryDateSchema = z.string().refine((value) => parseDiaryDate(value) !== null, {
  message: "Date must be a valid YYYY-MM-DD diary date.",
});
