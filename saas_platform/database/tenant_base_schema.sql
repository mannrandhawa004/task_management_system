-- Multi-Tenant SaaS Platform: Base Tenant Database Schema (21 Tables)
-- Generated automatically from database_dump.sql

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `role_permissions`
--

DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_role_permission` (`role_id`,`permission_id`),
  KEY `permission_id` (`permission_id`),
  CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
CREATE TABLE `departments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_dept_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `teams`
--

DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `department_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `lead_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_teams_department` (`department_id`),
  KEY `fk_teams_lead` (`lead_id`),
  CONSTRAINT `fk_teams_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teams_lead` FOREIGN KEY (`lead_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role_id` int(11) NOT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `avatar` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `department_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `reporting_manager_id` int(11) DEFAULT NULL,
  `team_id` int(11) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 50000.00,
  `dob` date DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  `two_factor_secret` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_employee_id` (`employee_id`),
  KEY `role_id` (`role_id`),
  KEY `fk_users_department` (`department_id`),
  KEY `fk_users_reporting_manager` (`reporting_manager_id`),
  KEY `fk_users_team` (`team_id`),
  CONSTRAINT `fk_users_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_reporting_manager` FOREIGN KEY (`reporting_manager_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_users_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL,
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `team_members`
--

DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `joined_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_user` (`team_id`,`user_id`),
  KEY `fk_team_members_user` (`user_id`),
  CONSTRAINT `fk_team_members_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_team_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive','completed') DEFAULT 'active',
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `department_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `fk_projects_department` (`department_id`),
  CONSTRAINT `fk_projects_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `project_roles`
--

DROP TABLE IF EXISTS `project_roles`;
CREATE TABLE `project_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
CREATE TABLE `project_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `joined_at` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_user` (`project_id`,`user_id`),
  KEY `user_id` (`user_id`),
  KEY `role_id` (`role_id`),
  CONSTRAINT `fk_project_members_project_role_id` FOREIGN KEY (`role_id`) REFERENCES `project_roles` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `project_members_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `project_teams`
--

DROP TABLE IF EXISTS `project_teams`;
CREATE TABLE `project_teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_project_team` (`project_id`,`team_id`),
  KEY `fk_project_teams_team` (`team_id`),
  CONSTRAINT `fk_project_teams_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_project_teams_team` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `project_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('todo','in_progress','completed') DEFAULT 'todo',
  `due_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `task_assignees`
--

DROP TABLE IF EXISTS `task_assignees`;
CREATE TABLE `task_assignees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `task_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_task_user` (`task_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_assignees_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_assignees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=106 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `attendance`
--

DROP TABLE IF EXISTS `attendance`;
CREATE TABLE `attendance` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` timestamp NULL DEFAULT NULL,
  `check_out` timestamp NULL DEFAULT NULL,
  `status` enum('present','late','half_day','absent','remote','on_leave','working','on_break') DEFAULT 'working',
  `working_hours` decimal(5,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `break_start` timestamp NULL DEFAULT NULL,
  `total_break_seconds` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_date` (`user_id`,`date`),
  CONSTRAINT `fk_attendance_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `leave_policies`
--

DROP TABLE IF EXISTS `leave_policies`;
CREATE TABLE `leave_policies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `leave_type` varchar(100) NOT NULL,
  `annual_quota` float DEFAULT 0,
  `is_paid` tinyint(1) DEFAULT 1,
  `carry_forward_limit` float DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `leave_type` (`leave_type`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `leaves`
--

DROP TABLE IF EXISTS `leaves`;
CREATE TABLE `leaves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('casual','sick','earned','wfh','half_day') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('pending','approved','rejected','cancelled') DEFAULT 'pending',
  `approved_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `leave_policy_id` int(11) DEFAULT NULL,
  `total_days` float DEFAULT 1,
  `lwp_days` float DEFAULT 0,
  `attachment` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `leaves_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `leaves_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `employee_leave_balances`
--

DROP TABLE IF EXISTS `employee_leave_balances`;
CREATE TABLE `employee_leave_balances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_policy_id` int(11) NOT NULL,
  `allocated` float DEFAULT 0,
  `used` float DEFAULT 0,
  `remaining` float DEFAULT 0,
  `year` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_balance` (`employee_id`,`leave_policy_id`,`year`),
  KEY `leave_policy_id` (`leave_policy_id`),
  CONSTRAINT `employee_leave_balances_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `employee_leave_balances_ibfk_2` FOREIGN KEY (`leave_policy_id`) REFERENCES `leave_policies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=358 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `leave_without_pay`
--

DROP TABLE IF EXISTS `leave_without_pay`;
CREATE TABLE `leave_without_pay` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `employee_id` int(11) NOT NULL,
  `leave_request_id` int(11) NOT NULL,
  `lwp_days` float NOT NULL,
  `deduction_amount` decimal(10,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(11) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=219 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=433 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- --------------------------------------------------------
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` text NOT NULL,
  `device` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=324 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ========================================================
-- Default Seed Data for New Tenant (System Roles & Policies)
-- ========================================================

-- Seed data for table `roles`
LOCK TABLES `roles` WRITE;
INSERT INTO `roles` (`id`, `name`) VALUES (1, 'admin');
INSERT INTO `roles` (`id`, `name`) VALUES (6, 'dept_head');
INSERT INTO `roles` (`id`, `name`) VALUES (3, 'employee');
INSERT INTO `roles` (`id`, `name`) VALUES (11, 'hr');
INSERT INTO `roles` (`id`, `name`) VALUES (10, 'intern');
INSERT INTO `roles` (`id`, `name`) VALUES (2, 'manager');
INSERT INTO `roles` (`id`, `name`) VALUES (7, 'project_manager');
INSERT INTO `roles` (`id`, `name`) VALUES (9, 'senior_employee');
INSERT INTO `roles` (`id`, `name`) VALUES (5, 'super_admin');
INSERT INTO `roles` (`id`, `name`) VALUES (8, 'team_lead');
UNLOCK TABLES;

-- Seed data for table `permissions`
LOCK TABLES `permissions` WRITE;
INSERT INTO `permissions` (`id`, `name`) VALUES (9, 'add_project_member');
INSERT INTO `permissions` (`id`, `name`) VALUES (13, 'assign_task');
INSERT INTO `permissions` (`id`, `name`) VALUES (5, 'create_project');
INSERT INTO `permissions` (`id`, `name`) VALUES (1, 'create_task');
INSERT INTO `permissions` (`id`, `name`) VALUES (7, 'delete_project');
INSERT INTO `permissions` (`id`, `name`) VALUES (3, 'delete_task');
INSERT INTO `permissions` (`id`, `name`) VALUES (16, 'manage_attendance');
INSERT INTO `permissions` (`id`, `name`) VALUES (14, 'manage_departments');
INSERT INTO `permissions` (`id`, `name`) VALUES (15, 'manage_teams');
INSERT INTO `permissions` (`id`, `name`) VALUES (10, 'remove_project_member');
INSERT INTO `permissions` (`id`, `name`) VALUES (11, 'update_own_task_status');
INSERT INTO `permissions` (`id`, `name`) VALUES (6, 'update_project');
INSERT INTO `permissions` (`id`, `name`) VALUES (8, 'update_project_status');
INSERT INTO `permissions` (`id`, `name`) VALUES (2, 'update_task\n');
INSERT INTO `permissions` (`id`, `name`) VALUES (4, 'update_task_status');
INSERT INTO `permissions` (`id`, `name`) VALUES (12, 'view_audit_logs');
INSERT INTO `permissions` (`id`, `name`) VALUES (17, 'view_reports');
UNLOCK TABLES;

-- Seed data for table `role_permissions`
LOCK TABLES `role_permissions` WRITE;
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (3, 1, 1);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (9, 1, 2);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (5, 1, 3);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (10, 1, 4);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (2, 1, 5);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (7, 1, 6);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (4, 1, 7);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (8, 1, 8);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (1, 1, 9);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (6, 1, 10);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (25, 1, 12);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (26, 1, 13);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (30, 1, 14);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (32, 1, 15);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (28, 1, 16);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (34, 1, 17);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (17, 2, 1);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (21, 2, 2);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (18, 2, 3);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (22, 2, 4);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (20, 2, 8);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (16, 2, 9);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (19, 2, 10);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (27, 2, 13);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (23, 3, 4);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (24, 3, 11);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (31, 5, 14);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (33, 5, 15);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (29, 5, 16);
INSERT INTO `role_permissions` (`id`, `role_id`, `permission_id`) VALUES (35, 5, 17);
UNLOCK TABLES;

-- Seed data for table `leave_policies`
LOCK TABLES `leave_policies` WRITE;
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (1, 'Casual Leave', 1, 1, 0, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (2, 'Sick Leave', 1, 1, 0, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (3, 'Earned Leave', 18, 1, 5, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (4, 'Maternity Leave', 90, 1, 0, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (5, 'Paternity Leave', 15, 1, 0, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (6, 'Work From Home', 0, 1, 0, 1, '2026-06-27 10:29:13');
INSERT INTO `leave_policies` (`id`, `leave_type`, `annual_quota`, `is_paid`, `carry_forward_limit`, `is_active`, `created_at`) VALUES (7, 'Unpaid Leave', 0, 0, 0, 1, '2026-06-27 10:29:13');
UNLOCK TABLES;

-- Seed data for table `project_roles`
LOCK TABLES `project_roles` WRITE;
INSERT INTO `project_roles` (`id`, `name`) VALUES (1, 'Manager');
INSERT INTO `project_roles` (`id`, `name`) VALUES (2, 'Member');
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS = 1;
