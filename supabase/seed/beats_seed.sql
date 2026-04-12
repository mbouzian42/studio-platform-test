-- ============================================================================
-- Studio Platform - Sample Beats Seed
-- ============================================================================

-- Ensure we have a beatmaker user to associate with
DO $$
DECLARE
    beatmaker_uuid UUID;
BEGIN
    -- Try to find an existing beatmaker, engineer, or admin
    SELECT id INTO beatmaker_uuid FROM profiles WHERE role IN ('beatmaker', 'engineer', 'admin') LIMIT 1;
    
    -- If no such user exists, use any user
    IF beatmaker_uuid IS NULL THEN
        SELECT id INTO beatmaker_uuid FROM profiles LIMIT 1;
    END IF;

    -- If still NULL (no users at all), we can't seed beats
    IF beatmaker_uuid IS NOT NULL THEN
        INSERT INTO beats (beatmaker_id, title, slug, bpm, key, genre, tags, price_simple, price_exclusive, is_published, audio_preview_url)
        VALUES 
        (
            beatmaker_uuid, 
            'Neon Dreams', 
            'neon-dreams', 
            128, 
            'C Minor', 
            'Synthwave', 
            ARRAY['80s', 'Retro', 'Analog'], 
            29.99, 
            299.99, 
            TRUE, 
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        ),
        (
            beatmaker_uuid, 
            'Midnight Chill', 
            'midnight-chill', 
            90, 
            'G Major', 
            'Lo-Fi', 
            ARRAY['Relax', 'Study', 'Chill'], 
            19.99, 
            199.99, 
            TRUE, 
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
        ),
        (
            beatmaker_uuid, 
            'Urban Heat', 
            'urban-heat', 
            140, 
            'F# Minor', 
            'Trap', 
            ARRAY['Drums', 'Bass', 'Club'], 
            34.99, 
            349.99, 
            TRUE, 
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
        ),
        (
            beatmaker_uuid, 
            'Acoustic Soul', 
            'acoustic-soul', 
            75, 
            'D Major', 
            'R&B', 
            ARRAY['Guitar', 'Smooth', 'Vocal'], 
            24.99, 
            249.99, 
            TRUE, 
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
        ),
        (
            beatmaker_uuid, 
            'Electric Vibes', 
            'electric-vibes', 
            120, 
            'A Minor', 
            'Pop', 
            ARRAY['Modern', 'Upbeat', 'Dance'], 
            39.99, 
            399.99, 
            TRUE, 
            'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
        );
    END IF;
END $$;
