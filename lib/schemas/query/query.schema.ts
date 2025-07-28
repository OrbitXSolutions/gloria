import { z } from "zod";


export const QuerySchema = z.object({
    queryString: z.string().optional(),
    page: z.number().optional(),
    limit: z.number().optional(),
});


export type Query = z.infer<typeof QuerySchema>;

