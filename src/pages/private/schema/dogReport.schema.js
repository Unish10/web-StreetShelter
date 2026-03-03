import { z } from 'zod';

export const dogReportSchema = z.object({
  location: z.string()
    .min(5, 'Location must be at least 5 characters')
    .max(200, 'Location is too long'),
  
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description is too long'),
  
  
  image: z.any().optional(),
  
  additionalNotes: z.string().optional()
});
