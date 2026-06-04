import { ZodError } from "zod";

import { requireUser } from "@/lib/auth/requireUser";
import { parseDiaryDate } from "@/lib/dates/parseDiaryDate";
import { saveEntryContent } from "@/lib/diary/saveEntryContent";
import { diaryEntrySchema } from "@/lib/validation/diary";

export async function POST(request: Request) {
  const user = await requireUser();

  try {
    const body = await request.json();
    const entryInput = diaryEntrySchema.parse(body);
    const date = parseDiaryDate(entryInput.date);

    if (!date) {
      return Response.json({ error: "Invalid diary entry." }, { status: 400 });
    }

    const entry = await saveEntryContent(user.id, date, entryInput.content);

    return Response.json({
      entry: {
        date: entryInput.date,
        content: entry.content,
        updatedAt: entry.updatedAt,
      },
    });
  } catch (error) {
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return Response.json({ error: "Invalid diary entry." }, { status: 400 });
    }

    return Response.json({ error: "Unable to save diary entry." }, { status: 500 });
  }
}
