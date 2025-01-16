-- First, remove surname entries
DELETE FROM characters
WHERE simplified IN ('李', '王', '张', '刘', '陈', '杨', '黄', '赵', '吴', '周', '徐', '孙', '马', '朱', '胡', '郭', '欧阳', '司马', '诸葛', '上官');

-- Then, add more characters that are commonly used in names
INSERT INTO characters (simplified, pinyin, meanings, frequency, strokes, is_common, gender, positions, combinations, tone)
VALUES
  ('英', 'yīng', ARRAY['hero', 'outstanding', 'excellent'], 90, 8, true, 'NEUTRAL', ARRAY['FIRST', 'LAST'], ARRAY['文', '华', '德', '明', '志'], 1),
  ('玉', 'yù', ARRAY['jade', 'pure', 'precious'], 88, 5, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['华', '英', '雅', '芳', '静'], 4),
  ('珊', 'shān', ARRAY['coral', 'beautiful', 'delicate'], 85, 9, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['玉', '雅', '芳', '美', '丽'], 1),
  ('瑜', 'yú', ARRAY['excellence', 'beautiful jade'], 84, 13, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['玉', '珊', '雅', '芳', '美'], 2),
  ('翔', 'xiáng', ARRAY['soar', 'glide', 'high flying'], 88, 12, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['志', '明', '德', '伟', '天'], 2),
  ('宸', 'chén', ARRAY['imperial', 'heavenly', 'majestic'], 86, 8, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '明', '德', '宇', '泽'], 2),
  ('浩', 'hào', ARRAY['vast', 'grand', 'heroic'], 89, 10, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '海', '宇', '志', '明'], 4),
  ('瑾', 'jǐn', ARRAY['jade', 'beautiful', 'precious'], 83, 14, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['玉', '珊', '雅', '芳', '美'], 3),
  ('熙', 'xī', ARRAY['bright', 'splendid', 'prosperous'], 87, 15, true, 'NEUTRAL', ARRAY['FIRST', 'LAST'], ARRAY['天', '明', '德', '宇', '华'], 1),
  ('晖', 'huī', ARRAY['sunshine', 'radiance', 'bright'], 85, 12, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '明', '德', '光', '华'], 1),
  ('彦', 'yàn', ARRAY['elegant', 'refined', 'accomplished'], 86, 9, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['文', '华', '德', '明', '志'], 4),
  ('君', 'jūn', ARRAY['monarch', 'noble', 'gentleman'], 88, 7, true, 'NEUTRAL', ARRAY['FIRST', 'LAST'], ARRAY['文', '华', '德', '明', '志'], 1),
  ('淑', 'shū', ARRAY['virtuous', 'pure', 'refined'], 84, 11, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['雅', '芳', '美', '丽', '慧'], 1),
  ('颖', 'yǐng', ARRAY['clever', 'brilliant', 'talented'], 87, 15, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['慧', '雅', '文', '华', '英'], 3),
  ('霖', 'lín', ARRAY['timely rain', 'continuous', 'beneficial'], 85, 16, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '雨', '泽', '德', '明'], 2),
  ('泓', 'hóng', ARRAY['deep water', 'profound', 'vast'], 83, 8, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '海', '泽', '志', '明'], 2),
  ('旭', 'xù', ARRAY['rising sun', 'bright', 'dawn'], 86, 6, true, 'M', ARRAY['FIRST', 'LAST'], ARRAY['天', '明', '光', '阳', '晖'], 4),
  ('璇', 'xuán', ARRAY['beautiful jade', 'precious'], 82, 14, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['玉', '珊', '瑜', '雅', '美'], 2),
  ('琪', 'qí', ARRAY['fine jade', 'precious'], 84, 12, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['玉', '珊', '瑜', '雅', '美'], 2),
  ('韵', 'yùn', ARRAY['charm', 'appeal', 'rhythm'], 85, 13, true, 'F', ARRAY['FIRST', 'LAST'], ARRAY['雅', '芳', '美', '丽', '慧'], 4);

-- Update existing characters with more combinations
UPDATE characters
SET combinations = combinations || ARRAY['英', '玉', '珊', '瑜']
WHERE simplified IN ('文', '华', '雅', '芳');

UPDATE characters
SET combinations = combinations || ARRAY['翔', '宸', '浩', '熙']
WHERE simplified IN ('志', '明', '德', '天'); 