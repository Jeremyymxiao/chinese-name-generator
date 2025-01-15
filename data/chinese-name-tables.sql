-- Create enum type for gender if it doesn't exist
DO $$ BEGIN
  CREATE TYPE gender AS ENUM ('M', 'F', 'NEUTRAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS character_name_entries;
DROP TABLE IF EXISTS name_entries;
DROP TABLE IF EXISTS characters;

-- Characters table
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

-- Name entries table
CREATE TABLE name_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    popularity INTEGER NOT NULL DEFAULT 0,
    gender gender,
    style TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table for many-to-many relationship
CREATE TABLE character_name_entries (
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    name_entry_id UUID REFERENCES name_entries(id) ON DELETE CASCADE,
    PRIMARY KEY (character_id, name_entry_id)
);

-- Add indexes for better query performance
CREATE INDEX idx_characters_simplified ON characters(simplified);
CREATE INDEX idx_characters_frequency ON characters(frequency);
CREATE INDEX idx_characters_is_common ON characters(is_common);
CREATE INDEX idx_name_entries_popularity ON name_entries(popularity);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at
    BEFORE UPDATE ON characters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 