-- Sự kiện câu cá: item, animation, gameplay nhiều bước, chế tạo và mốc động.
-- DDL của MariaDB tự commit; mỗi câu lệnh bên dưới được viết để có thể chạy lại.

INSERT INTO `item_template`
(`id`,`type`,`gender`,`name`,`description`,`level`,`icon_id`,`part`,`is_up_to_up`,`power_require`,`gold`,`gem`,`head`,`body`,`leg`,`is_up_to_up_over_99`,`can_trade`,`comment`)
VALUES
(1989,27,3,'Cần câu thường','Cần khởi đầu; chờ cá lâu và dễ kéo hụt',1,32619,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1990,27,3,'Mồi kiến','Mồi câu; mỗi lượt câu tiêu hao 1 cái',1,32625,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1991,27,3,'Cá lục','Cá phổ biến của sự kiện câu cá',1,32634,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1992,27,3,'Cá kiếm đại dương','Cá biển hiếm của sự kiện câu cá',1,32623,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1993,27,3,'Cá voi xanh','Cá biển hiếm của sự kiện câu cá',1,32624,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1994,27,3,'Cá Koi hoàng kim','Cá hiếm của sự kiện câu cá',1,32631,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1995,27,3,'Sao biển pha lê','Sinh vật biển hiếm của sự kiện câu cá',1,32632,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1996,27,3,'Cua hoàng đế','Sinh vật biển cực hiếm của sự kiện câu cá',1,32633,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1997,27,3,'Cần câu cao cấp','Cần bạc xanh; cá cắn nhanh và khó vùng thoát hơn',1,32620,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1998,27,3,'Cần câu VIP','Cần vàng VIP; câu nhanh, bền và tỷ lệ kéo cao nhất',1,32621,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1999,27,3,'Cá mập ngàn cân','Cá biển cực hiếm của sự kiện câu cá',1,32622,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(2000,27,3,'Mảnh Gỗ Linh Lực','Nguyên liệu chế tạo cần câu; săn boss để nhận',1,12140,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(2001,27,3,'Tinh Hoa Đại Dương','Nguyên liệu hiếm chế tạo cần và mồi cao cấp',1,22641,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(2002,27,3,'Mồi giun','Mồi tốt, tăng khả năng kéo cá thành công',1,32626,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(2003,27,3,'Mồi Hải Vương','Mồi VIP, tăng mạnh khả năng kéo cá thành công',1,32627,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(2004,27,3,'Bộ sửa cần câu','Dùng để hồi 250 độ bền cho cần hư nhất trong túi',1,9406,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event')
ON DUPLICATE KEY UPDATE
`type`=VALUES(`type`),`gender`=VALUES(`gender`),`name`=VALUES(`name`),
`description`=VALUES(`description`),`level`=VALUES(`level`),`icon_id`=VALUES(`icon_id`),
`part`=VALUES(`part`),`is_up_to_up`=VALUES(`is_up_to_up`),
`power_require`=VALUES(`power_require`),`gold`=VALUES(`gold`),`gem`=VALUES(`gem`),
`head`=VALUES(`head`),`body`=VALUES(`body`),`leg`=VALUES(`leg`),
`is_up_to_up_over_99`=VALUES(`is_up_to_up_over_99`),`can_trade`=VALUES(`can_trade`),
`comment`=VALUES(`comment`);

UPDATE `item_template`
SET `description`='Vật phẩm thu thập sự kiện câu cá',
    `icon_id`=CASE `id`
        WHEN 1002 THEN 32628
        WHEN 1003 THEN 32629
        WHEN 1004 THEN 32630
    END,
    `is_up_to_up`=1, `is_up_to_up_over_99`=1, `can_trade`=0
WHERE `id` IN (1002,1003,1004);

INSERT INTO `flag_bag` (`id`,`icon_data`,`NAME`,`gold`,`gem`,`icon_id`) VALUES
(186,'32635,32636,32637,32638,32639,32640,32641,32642,32643,32644,32645,32646,32647,32648','Cần câu thường',-1,-1,32619),
(187,'32649,32650,32651,32652,32653,32654,32655,32656,32657,32658,32659,32660,32661,32662','Cần câu cao cấp',-1,-1,32620),
(188,'32663,32664,32665,32666,32667,32668,32669,32670,32671,32672,32673,32674,32675,32676','Cần câu VIP',-1,-1,32621)
ON DUPLICATE KEY UPDATE
`icon_data`=VALUES(`icon_data`),`NAME`=VALUES(`NAME`),
`gold`=VALUES(`gold`),`gem`=VALUES(`gem`),`icon_id`=VALUES(`icon_id`);

-- Xác suất, cân nặng và công thức điểm của từng loài có thể sửa trực tiếp từ web/SQL.
CREATE TABLE IF NOT EXISTS `fishing_fish_config` (
  `item_id` int(11) NOT NULL,
  `catch_weight` int(10) unsigned NOT NULL DEFAULT 1 COMMENT 'Trọng số xác suất, không phải phần trăm',
  `min_weight_grams` int(10) unsigned NOT NULL DEFAULT 1,
  `max_weight_grams` int(10) unsigned NOT NULL DEFAULT 1000,
  `base_points` bigint(20) unsigned NOT NULL DEFAULT 0,
  `points_per_kg` int(10) unsigned NOT NULL DEFAULT 1,
  `escape_rate_bps` int(10) unsigned NOT NULL DEFAULT 0 COMMENT 'Tỷ lệ vùng thoát, 10000 = 100%',
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_fishing_fish_item` FOREIGN KEY (`item_id`) REFERENCES `item_template` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `fishing_fish_config`
  ADD COLUMN IF NOT EXISTS `escape_rate_bps` int(10) unsigned NOT NULL DEFAULT 0 AFTER `points_per_kg`;

INSERT INTO `fishing_fish_config`
(`item_id`,`catch_weight`,`min_weight_grams`,`max_weight_grams`,`base_points`,`points_per_kg`,`escape_rate_bps`,`enabled`,`sort_order`)
VALUES
(1991,20,500,4000,5,2,100,1,10),
(1002,20,300,2500,5,2,100,1,20),
(1003,20,100,1000,5,3,150,1,30),
(1004,20,500,5000,8,3,250,1,40),
(1994,10,1000,12000,15,4,500,1,50),
(1995,10,500,8000,15,5,700,1,60),
(1996,5,3000,30000,40,6,1400,1,70),
(1992,4,10000,300000,60,7,1800,1,80),
(1999,3,50000,1000000,100,8,2500,1,90),
(1993,2,100000,2000000,150,10,3000,1,100)
ON DUPLICATE KEY UPDATE
`catch_weight`=VALUES(`catch_weight`),`min_weight_grams`=VALUES(`min_weight_grams`),
`max_weight_grams`=VALUES(`max_weight_grams`),`base_points`=VALUES(`base_points`),
`points_per_kg`=VALUES(`points_per_kg`),`escape_rate_bps`=VALUES(`escape_rate_bps`),
`enabled`=VALUES(`enabled`),`sort_order`=VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fishing_rod_config` (
  `rod_item_id` int(11) NOT NULL,
  `cast_time_ms` int(10) unsigned NOT NULL,
  `wait_min_ms` int(10) unsigned NOT NULL,
  `wait_max_ms` int(10) unsigned NOT NULL,
  `pull_time_ms` int(10) unsigned NOT NULL,
  `success_rate_bps` int(10) unsigned NOT NULL,
  `durability_loss_success` int(10) unsigned NOT NULL,
  `durability_loss_fail` int(10) unsigned NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`rod_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fishing_rod_config` VALUES
(1989,1200,7000,13000,2500,7000,20,40,1,10),
(1997,800,4500,9000,1600,8200,12,25,1,20),
(1998,500,2500,6000,900,9200,7,15,1,30)
ON DUPLICATE KEY UPDATE `cast_time_ms`=VALUES(`cast_time_ms`),`wait_min_ms`=VALUES(`wait_min_ms`),
`wait_max_ms`=VALUES(`wait_max_ms`),`pull_time_ms`=VALUES(`pull_time_ms`),
`success_rate_bps`=VALUES(`success_rate_bps`),`durability_loss_success`=VALUES(`durability_loss_success`),
`durability_loss_fail`=VALUES(`durability_loss_fail`),`enabled`=VALUES(`enabled`),`sort_order`=VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fishing_bait_config` (
  `bait_item_id` int(11) NOT NULL,
  `success_bonus_bps` int(10) unsigned NOT NULL DEFAULT 0,
  `priority` int(11) NOT NULL DEFAULT 0,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`bait_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fishing_bait_config` VALUES
(1990,0,10,1),(2002,700,20,1),(2003,1500,30,1)
ON DUPLICATE KEY UPDATE `success_bonus_bps`=VALUES(`success_bonus_bps`),
`priority`=VALUES(`priority`),`enabled`=VALUES(`enabled`);

CREATE TABLE IF NOT EXISTS `fishing_craft_recipe` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `result_item_id` int(11) NOT NULL,
  `result_quantity` int(10) unsigned NOT NULL DEFAULT 1,
  `ingredients` longtext NOT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fishing_recipe_name` (`name`),
  CONSTRAINT `chk_fishing_recipe_ingredients_json` CHECK (json_valid(`ingredients`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fishing_craft_recipe`
(`name`,`result_item_id`,`result_quantity`,`ingredients`,`enabled`,`sort_order`) VALUES
('Chế Cần câu thường',1989,1,'[{"item_id":2000,"quantity":20},{"item_id":2001,"quantity":2}]',1,10),
('Chế Cần câu cao cấp',1997,1,'[{"item_id":2000,"quantity":100},{"item_id":2001,"quantity":20}]',1,20),
('Chế Cần câu VIP',1998,1,'[{"item_id":2000,"quantity":300},{"item_id":2001,"quantity":80}]',1,30),
('Chế 20 Mồi kiến',1990,20,'[{"item_id":2000,"quantity":5}]',1,40),
('Chế 20 Mồi giun',2002,20,'[{"item_id":2000,"quantity":10},{"item_id":2001,"quantity":2}]',1,50),
('Chế 10 Mồi Hải Vương',2003,10,'[{"item_id":2000,"quantity":20},{"item_id":2001,"quantity":10}]',1,60),
('Chế Bộ sửa cần câu',2004,1,'[{"item_id":2000,"quantity":15},{"item_id":2001,"quantity":3}]',1,70)
ON DUPLICATE KEY UPDATE `result_item_id`=VALUES(`result_item_id`),`result_quantity`=VALUES(`result_quantity`),
`ingredients`=VALUES(`ingredients`),`enabled`=VALUES(`enabled`),`sort_order`=VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fishing_rank` (
  `season_id` varchar(32) NOT NULL,
  `player_id` int(11) NOT NULL,
  `catch_count` bigint(20) unsigned NOT NULL DEFAULT 0,
  `score` bigint(20) unsigned NOT NULL DEFAULT 0,
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`season_id`,`player_id`),
  KEY `idx_fishing_rank_season_points` (`season_id`,`score` DESC,`catch_count` DESC,`player_id` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `fishing_rank`
  ADD COLUMN IF NOT EXISTS `score` bigint(20) unsigned NOT NULL DEFAULT 0 AFTER `catch_count`;
DROP INDEX IF EXISTS `idx_fishing_rank_season_score` ON `fishing_rank`;
CREATE INDEX IF NOT EXISTS `idx_fishing_rank_season_points`
  ON `fishing_rank` (`season_id`,`score` DESC,`catch_count` DESC,`player_id` ASC);

-- Có thể thêm bao nhiêu mốc tùy ý. reward_items dùng cùng JSON với các mốc nạp/achievement.
CREATE TABLE IF NOT EXISTS `fishing_milestone` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `season_id` varchar(32) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `required_points` bigint(20) unsigned NOT NULL,
  `reward_items` longtext NOT NULL DEFAULT '[]',
  `reward_gold` bigint(20) unsigned NOT NULL DEFAULT 0,
  `reward_gem` int(11) NOT NULL DEFAULT 0,
  `reward_ruby` int(11) NOT NULL DEFAULT 0,
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_fishing_milestone_season_points` (`season_id`,`required_points`),
  UNIQUE KEY `uk_fishing_milestone_season_id` (`season_id`,`id`),
  CONSTRAINT `chk_fishing_milestone_reward_json` CHECK (json_valid(`reward_items`)),
  KEY `idx_fishing_milestone_season_order` (`season_id`,`enabled`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE UNIQUE INDEX IF NOT EXISTS `uk_fishing_milestone_season_id`
  ON `fishing_milestone` (`season_id`,`id`);
SET @has_reward_json_check := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE constraint_schema=DATABASE() AND table_name='fishing_milestone'
    AND constraint_name='chk_fishing_milestone_reward_json'
);
SET @add_reward_json_check_sql := IF(@has_reward_json_check=0,
  'ALTER TABLE fishing_milestone ADD CONSTRAINT chk_fishing_milestone_reward_json CHECK (json_valid(reward_items))',
  'SELECT 1');
PREPARE add_reward_json_check_stmt FROM @add_reward_json_check_sql;
EXECUTE add_reward_json_check_stmt;
DEALLOCATE PREPARE add_reward_json_check_stmt;

INSERT INTO `fishing_milestone`
(`season_id`,`name`,`description`,`required_points`,`reward_items`,`reward_gold`,`reward_gem`,`reward_ruby`,`enabled`,`sort_order`)
VALUES
('2026-08','Mốc 1','Khởi đầu hành trình câu cá',100,'[{"temp_id":1990,"quantity":50,"options":[]}]',0,50,0,1,10),
('2026-08','Mốc 2','Thợ câu tập sự',500,'[{"temp_id":1997,"quantity":1,"options":[]}]',0,100,0,1,20),
('2026-08','Mốc 3','Thợ câu lành nghề',1500,'[{"temp_id":1010,"quantity":1,"options":[{"id":50,"param":25},{"id":77,"param":25},{"id":103,"param":25},{"id":93,"param":3}]}]',0,200,0,1,30),
('2026-08','Mốc 4','Bậc thầy câu cá',5000,'[{"temp_id":1998,"quantity":1,"options":[]}]',0,500,0,1,40),
('2026-08','Mốc 5','Vua câu cá',15000,'[{"temp_id":1224,"quantity":1,"options":[]}]',0,1000,0,1,50)
ON DUPLICATE KEY UPDATE
`name`=VALUES(`name`),`description`=VALUES(`description`),`reward_items`=VALUES(`reward_items`),
`reward_gold`=VALUES(`reward_gold`),`reward_gem`=VALUES(`reward_gem`),
`reward_ruby`=VALUES(`reward_ruby`),`enabled`=VALUES(`enabled`),`sort_order`=VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fishing_milestone_claim` (
  `season_id` varchar(32) NOT NULL,
  `player_id` int(11) NOT NULL,
  `milestone_id` int(10) unsigned NOT NULL,
  `claimed_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`season_id`,`player_id`,`milestone_id`),
  KEY `idx_fishing_claim_milestone` (`milestone_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Nâng cấp an toàn từ bản thử nghiệm cũ dùng cột `milestone`.
SET @has_old_milestone := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema=DATABASE() AND table_name='fishing_milestone_claim' AND column_name='milestone'
);
SET @has_new_milestone := (
  SELECT COUNT(*) FROM information_schema.columns
  WHERE table_schema=DATABASE() AND table_name='fishing_milestone_claim' AND column_name='milestone_id'
);
SET @upgrade_claim_sql := IF(@has_old_milestone=1 AND @has_new_milestone=0,
  'ALTER TABLE fishing_milestone_claim CHANGE COLUMN milestone milestone_id INT UNSIGNED NOT NULL',
  'SELECT 1');
PREPARE upgrade_claim_stmt FROM @upgrade_claim_sql;
EXECUTE upgrade_claim_stmt;
DEALLOCATE PREPARE upgrade_claim_stmt;
CREATE INDEX IF NOT EXISTS `idx_fishing_claim_milestone`
  ON `fishing_milestone_claim` (`milestone_id`);

SET @has_claim_fk := (
  SELECT COUNT(*) FROM information_schema.table_constraints
  WHERE constraint_schema=DATABASE() AND table_name='fishing_milestone_claim'
    AND constraint_name='fk_fishing_claim_milestone'
);
SET @add_claim_fk_sql := IF(@has_claim_fk=0,
  'ALTER TABLE fishing_milestone_claim ADD CONSTRAINT fk_fishing_claim_milestone FOREIGN KEY (season_id,milestone_id) REFERENCES fishing_milestone(season_id,id) ON DELETE RESTRICT ON UPDATE CASCADE',
  'SELECT 1');
PREPARE add_claim_fk_stmt FROM @add_claim_fk_sql;
EXECUTE add_claim_fk_stmt;
DEALLOCATE PREPARE add_claim_fk_stmt;
