import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** Preguntas frecuentes por idioma: src/content/faq/<locale>/<nn>-<slug>.md */
const faq = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string().min(5),
    order: z.number().int().nonnegative(),
  }),
});

export const collections = { faq };
