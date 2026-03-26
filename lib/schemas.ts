import { z } from "zod";

export const EventSchema = z.object({
  title: z.string(),
  startDateTime: z.string(),
  endDateTime: z.string(),
  allDay: z.union([z.boolean(), z.null()]),
  location: z.string().optional().nullable(),
  memo: z.string().optional().nullable(),
});

export const ExtractResponseSchema = z.object({
  events: z.array(EventSchema),
  warnings: z.array(z.string()),
});

export type Event = z.infer<typeof EventSchema>;
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

export function isEventComplete(event: Event): boolean {
  return (
    !!event.title &&
    !!event.startDateTime &&
    !!event.endDateTime &&
    event.allDay !== null &&
    event.allDay !== undefined
  );
}
