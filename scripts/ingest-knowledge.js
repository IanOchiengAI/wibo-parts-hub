import { createClient } from '@supabase/supabase-js';
import { pipeline, env } from '@xenova/transformers';
import fs from 'fs';
import path from 'path';

// Disable local model caching to always use the Hugging Face CDN
env.allowLocalModels = false;

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

let extractor = null;

/**
 * Generates an embedding vector using local Transformers.js (gte-small, 384 dims). FREE!
 */
async function generateEmbedding(text) {
  if (!extractor) {
    console.log("Loading gte-small model from Hugging Face (first time only)...");
    extractor = await pipeline('feature-extraction', 'Supabase/gte-small');
    console.log("Model loaded!");
  }
  const output = await extractor(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

/**
 * Ingests a text file into the Supabase knowledge base.
 */
async function ingestDocument(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = path.basename(filePath, path.extname(filePath));

  console.log(`\nProcessing: ${title}`);

  // Split by double newlines (paragraphs), filter out very short chunks
  const chunks = content.split('\n\n').map(c => c.trim()).filter(c => c.length > 50);

  console.log(`Found ${chunks.length} chunks. Generating embeddings locally...`);

  let count = 0;
  for (const chunk of chunks) {
    try {
      const embedding = await generateEmbedding(chunk);

      const { error } = await supabase.from('knowledge_base').insert({
        title,
        content: chunk,
        embedding,
        metadata: { source: filePath }
      });

      if (error) {
        console.error(`  ✗ Error inserting chunk: ${error.message}`);
      } else {
        count++;
        process.stdout.write(`  ✓ Chunk ${count}/${chunks.length}\r`);
      }
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
    }
  }

  console.log(`\nDone! Successfully ingested ${count}/${chunks.length} chunks from "${title}".`);
}

// Usage: node scripts/ingest-knowledge.js path/to/research.txt
const targetFile = process.argv[2];
if (targetFile) {
  ingestDocument(targetFile);
} else {
  console.log("Usage: node scripts/ingest-knowledge.js <path-to-text-file>");
}
