-- Drop old table and function (safely on fresh database)
DROP FUNCTION IF EXISTS match_knowledge_base(vector(1536), float, int);
DROP TABLE IF EXISTS public.knowledge_base;

-- Create the knowledge_base table with 384 dimensions
CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Allow read access
CREATE POLICY "Allow public read access on knowledge_base"
    ON public.knowledge_base FOR SELECT
    USING (true);

-- Create match_knowledge_base function with vector(384)
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
