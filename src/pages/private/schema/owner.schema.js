import { z } from 'zod';

export const ownerRegistrationSchema = z.object({
  business_name: z.string()
    .min(2, 'Business name must be at least 2 characters')
    .max(150, 'Business name is too long'),
  
  id_number: z.string()
    .min(5, 'ID number must be at least 5 characters')
    .max(50, 'ID number is too long')
    .regex(/^[A-Z0-9-]+$/, 'ID number should only contain uppercase letters, numbers, and hyphens'),
  
  ownership_type: z.enum(['shelter', 'rescue_center', 'veterinary_clinic', 'individual', 'ngo'], {
    errorMap: () => ({ message: 'Please select an ownership type' })
  }),
  
  description: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : val,
    z.string()
      .min(20, 'Description must be at least 20 characters if provided')
      .max(500, 'Description is too long')
      .optional()
  ),
  
  capacity: z.preprocess(
    (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
    z.number()
      .min(1, 'Capacity must be at least 1')
      .max(1000, 'Capacity seems too high')
      .optional()
  )
});
