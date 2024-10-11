import { z } from 'zod';

// Book schema
export const bookSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    price: z.number().positive("Price must be a positive number"),
    image: z.string().min(1, "Book image required"),
    description: z.string().min(1, "Description required")
});

// Type for book data
export type BookSchema = z.infer<typeof bookSchema>;


