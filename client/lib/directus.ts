import { createDirectus, rest, readItems } from '@directus/sdk';
import { Schema } from './schema';

const directus = createDirectus<Schema>(process.env.NEXT_PUBLIC_DIRECTUS_URL!).with(rest());

export default directus;