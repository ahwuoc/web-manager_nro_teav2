-- Sự kiện câu cá: item, animation, cấu hình cá, điểm, mốc thưởng động.
START TRANSACTION;

INSERT INTO `item_template`
(`id`,`type`,`gender`,`name`,`description`,`level`,`icon_id`,`part`,`is_up_to_up`,`power_require`,`gold`,`gem`,`head`,`body`,`leg`,`is_up_to_up_over_99`,`can_trade`,`comment`)
VALUES
(1989,27,3,'Cần câu thường','Dùng tại Đảo Kame; thời gian thả câu 3 giây',1,32619,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1990,27,3,'Mồi kiến','Mồi câu; mỗi lượt câu tiêu hao 1 cái',1,32625,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1991,27,3,'Cá lục','Cá phổ biến của sự kiện câu cá',1,32634,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1992,27,3,'Cá kiếm đại dương','Cá biển hiếm của sự kiện câu cá',1,32623,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1993,27,3,'Cá voi xanh','Cá biển hiếm của sự kiện câu cá',1,32624,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1994,27,3,'Cá Koi hoàng kim','Cá hiếm của sự kiện câu cá',1,32631,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1995,27,3,'Sao biển pha lê','Sinh vật biển hiếm của sự kiện câu cá',1,32632,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1996,27,3,'Cua hoàng đế','Sinh vật biển cực hiếm của sự kiện câu cá',1,32633,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event'),
(1997,27,3,'Cần câu cao cấp','Cần bạc xanh; thời gian thả câu 2 giây',1,32620,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1998,27,3,'Cần câu VIP','Cần vàng VIP; thời gian thả câu 1 giây',1,32621,-1,0,0,0,0,-1,-1,-1,0,1,'fishing_event'),
(1999,27,3,'Cá mập ngàn cân','Cá biển cực hiếm của sự kiện câu cá',1,32622,-1,1,0,0,0,-1,-1,-1,1,0,'fishing_event')
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
  `enabled` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`item_id`),
  CONSTRAINT `fk_fishing_fish_item` FOREIGN KEY (`item_id`) REFERENCES `item_template` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `fishing_fish_config`
(`item_id`,`catch_weight`,`min_weight_grams`,`max_weight_grams`,`base_points`,`points_per_kg`,`enabled`,`sort_order`)
VALUES
(1991,20,500,4000,5,2,1,10),
(1002,20,300,2500,5,2,1,20),
(1003,20,100,1000,5,3,1,30),
(1004,20,500,5000,8,3,1,40),
(1994,10,1000,12000,15,4,1,50),
(1995,10,500,8000,15,5,1,60),
(1996,5,3000,30000,40,6,1,70),
(1992,4,10000,300000,60,7,1,80),
(1999,3,50000,1000000,100,8,1,90),
(1993,2,100000,2000000,150,10,1,100)
ON DUPLICATE KEY UPDATE
`catch_weight`=VALUES(`catch_weight`),`min_weight_grams`=VALUES(`min_weight_grams`),
`max_weight_grams`=VALUES(`max_weight_grams`),`base_points`=VALUES(`base_points`),
`points_per_kg`=VALUES(`points_per_kg`),`enabled`=VALUES(`enabled`),`sort_order`=VALUES(`sort_order`);

CREATE TABLE IF NOT EXISTS `fishing_rank` (
  `season_id` varchar(32) NOT NULL,
  `player_id` int(11) NOT NULL,
  `catch_count` bigint(20) unsigned NOT NULL DEFAULT 0,
  `score` bigint(20) unsigned NOT NULL DEFAULT 0,
  `updated_at` timestamp(3) NOT NULL DEFAULT current_timestamp(3) ON UPDATE current_timestamp(3),
  PRIMARY KEY (`season_id`,`player_id`),
  KEY `idx_fishing_rank_season_score` (`season_id`,`score` DESC,`catch_count` DESC,`player_id` ASC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `fishing_rank`
  ADD COLUMN IF NOT EXISTS `score` bigint(20) unsigned NOT NULL DEFAULT 0 AFTER `catch_count`;
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
  KEY `idx_fishing_milestone_season_order` (`season_id`,`enabled`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

COMMIT;
