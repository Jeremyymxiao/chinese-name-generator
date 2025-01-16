-- Update combinations for common first-last character pairs
UPDATE characters
SET combinations = ARRAY['民', '安', '德', '华', '明', '文']
WHERE simplified = '爱';

UPDATE characters
SET combinations = ARRAY['爱', '和', '志', '德', '华', '明']
WHERE simplified = '民';

UPDATE characters
SET combinations = ARRAY['安', '平', '民', '德', '华', '明']
WHERE simplified = '和';

UPDATE characters
SET combinations = ARRAY['和', '乐', '康', '宁', '泰', '民']
WHERE simplified = '安';

UPDATE characters
SET combinations = ARRAY['安', '康', '和', '宁', '泰', '民']
WHERE simplified = '乐';

-- Update positions to ensure characters can be used in appropriate positions
UPDATE characters
SET positions = ARRAY['FIRST']
WHERE simplified IN ('爱', '和');

UPDATE characters
SET positions = ARRAY['LAST']
WHERE simplified IN ('民', '安');

-- Add more combinations for other common characters
UPDATE characters
SET combinations = combinations || ARRAY['爱', '和', '民', '安']
WHERE simplified IN ('德', '华', '明', '文');

-- Update frequency to prefer these combinations
UPDATE characters
SET frequency = 95
WHERE simplified IN ('爱', '民', '和', '安', '乐'); 