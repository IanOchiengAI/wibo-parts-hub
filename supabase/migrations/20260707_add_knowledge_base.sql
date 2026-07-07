-- Enable the pgvector extension to work with embedding vectors
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop old table and function if dimensions have changed (safe on fresh database)
DROP FUNCTION IF EXISTS match_knowledge_base(vector(1536), float, int);
DROP TABLE IF EXISTS public.knowledge_base;

-- Create the knowledge_base table
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    -- Store embeddings as 384-dimensional vectors (gte-small / Transformers.js)
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow read access for authenticated users/anon to allow AI to search
CREATE POLICY "Allow public read access on knowledge_base"
    ON public.knowledge_base FOR SELECT
    USING (true);

-- Create a function to search for similarity
CREATE OR REPLACE FUNCTION match_knowledge_base (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kb.id,
    kb.title,
    kb.content,
    1 - (kb.embedding <=> query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE 1 - (kb.embedding <=> query_embedding) > match_threshold
  ORDER BY kb.embedding <=> query_embedding
  LIMIT match_count;
$$;
