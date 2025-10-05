import { config } from 'dotenv';
config();

import '@/ai/flows/extract-action-points-and-categorize-documents.ts';
import '@/ai/flows/process-zip-file.ts';
import '@/ai/flows/summarize-document.ts';
