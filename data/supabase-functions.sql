-- Function to create gender enum
CREATE OR REPLACE FUNCTION create_gender_enum()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender') THEN
    CREATE TYPE gender AS ENUM ('M', 'F', 'NEUTRAL');
  END IF;
END;
$$;

-- Function to create characters table
CREATE OR REPLACE FUNCTION create_characters_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'characters') THEN
    CREATE TABLE characters (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      simplified TEXT NOT NULL UNIQUE,
      pinyin TEXT NOT NULL,
      meanings TEXT[] NOT NULL DEFAULT '{}',
      frequency INTEGER NOT NULL,
      strokes INTEGER NOT NULL,
      is_common BOOLEAN NOT NULL DEFAULT false,
      gender gender,
      positions TEXT[] NOT NULL DEFAULT '{}',
      combinations TEXT[] NOT NULL DEFAULT '{}',
      tone INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_characters_simplified ON characters(simplified);
    CREATE INDEX idx_characters_frequency ON characters(frequency);
    CREATE INDEX idx_characters_is_common ON characters(is_common);
  END IF;
END;
$$;

-- Function to create name entries table
CREATE OR REPLACE FUNCTION create_name_entries_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'name_entries') THEN
    CREATE TABLE name_entries (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      popularity INTEGER NOT NULL DEFAULT 0,
      gender gender,
      style TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_name_entries_popularity ON name_entries(popularity);
  END IF;
END;
$$;

-- Function to create junction table
CREATE OR REPLACE FUNCTION create_character_name_entries_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'character_name_entries') THEN
    CREATE TABLE character_name_entries (
      character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
      name_entry_id UUID REFERENCES name_entries(id) ON DELETE CASCADE,
      PRIMARY KEY (character_id, name_entry_id)
    );
  END IF;
END;
$$; 