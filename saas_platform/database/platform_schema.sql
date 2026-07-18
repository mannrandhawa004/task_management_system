-- Multi-Tenant SaaS Control Plane Database (`saas_platform_db`)
-- Stores all company tenants, subscription plans, billing status, and database routing details.

CREATE DATABASE IF NOT EXISTS `saas_platform_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `saas_platform_db`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- 1. Table structure for `subscription_plans`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `subscription_plans`;
CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `description` text DEFAULT NULL,
  `price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_yearly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `max_users` int(11) NOT NULL DEFAULT 10,
  `max_projects` int(11) NOT NULL DEFAULT 5,
  `max_storage_gb` int(11) NOT NULL DEFAULT 5,
  `features_json` json DEFAULT NULL,
  `is_active` boolean DEFAULT true,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for `tenants` (Subscribed Companies)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) NOT NULL,
  `slug` varchar(100) NOT NULL UNIQUE,
  `custom_domain` varchar(255) DEFAULT NULL UNIQUE,
  `contact_name` varchar(255) NOT NULL,
  `contact_email` varchar(255) NOT NULL UNIQUE,
  `contact_phone` varchar(50) DEFAULT NULL,
  `db_name` varchar(100) NOT NULL UNIQUE,
  `db_host` varchar(255) NOT NULL DEFAULT 'localhost',
  `db_user` varchar(100) NOT NULL DEFAULT 'root',
  `db_password` varchar(255) DEFAULT NULL,
  `status` enum('active','suspended','trial','cancelled') NOT NULL DEFAULT 'active',
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  INDEX `idx_tenant_slug` (`slug`),
  INDEX `idx_tenant_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for `tenant_subscriptions`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `tenant_subscriptions`;
CREATE TABLE `tenant_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `billing_cycle` enum('monthly','yearly','lifetime') NOT NULL DEFAULT 'monthly',
  `status` enum('active','past_due','cancelled','trialing') NOT NULL DEFAULT 'active',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `currency` char(3) NOT NULL DEFAULT 'USD',
  `payment_method` varchar(50) DEFAULT 'stripe',
  `transaction_reference` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subscription_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_subscription_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for payment-gated workspace signups
-- Passwords are stored only as bcrypt hashes and cleared after provisioning.
-- --------------------------------------------------------
DROP TABLE IF EXISTS `signup_checkouts`;
CREATE TABLE `signup_checkouts` (
  `id` char(36) NOT NULL,
  `gateway` enum('stripe','razorpay') NOT NULL,
  `gateway_session_id` varchar(255) DEFAULT NULL,
  `gateway_payment_id` varchar(255) DEFAULT NULL,
  `plan_id` int(11) NOT NULL,
  `billing_cycle` enum('monthly','yearly') NOT NULL,
  `amount_minor` bigint unsigned NOT NULL,
  `currency` char(3) NOT NULL,
  `company_name` varchar(120) NOT NULL,
  `workspace_slug` varchar(50) NOT NULL,
  `contact_name` varchar(120) NOT NULL,
  `contact_email` varchar(254) NOT NULL,
  `contact_phone` varchar(50) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `avatar_public_id` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `status` enum('pending','paid','provisioning','provisioned','failed','expired') NOT NULL DEFAULT 'pending',
  `tenant_id` int(11) DEFAULT NULL,
  `failure_reason` varchar(500) DEFAULT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_signup_gateway_session` (`gateway_session_id`),
  INDEX `idx_signup_checkout_status` (`status`),
  INDEX `idx_signup_checkout_slug` (`workspace_slug`),
  INDEX `idx_signup_checkout_email` (`contact_email`),
  CONSTRAINT `fk_signup_checkout_plan` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_signup_checkout_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Single-use paid onboarding handoffs
-- Only SHA-256 token hashes are stored; raw tokens are never persisted.
-- --------------------------------------------------------
DROP TABLE IF EXISTS `onboarding_handoffs`;
CREATE TABLE `onboarding_handoffs` (
  `id` char(36) NOT NULL,
  `checkout_id` char(36) NOT NULL,
  `token_hash` char(64) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `expires_at` datetime NOT NULL,
  `consumed_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_onboarding_handoff_token` (`token_hash`),
  INDEX `idx_onboarding_handoff_checkout` (`checkout_id`),
  INDEX `idx_onboarding_handoff_expiry` (`expires_at`),
  CONSTRAINT `fk_onboarding_handoff_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Default Seed Data for `subscription_plans`
-- --------------------------------------------------------
LOCK TABLES `subscription_plans` WRITE;
INSERT INTO `subscription_plans` (`id`, `name`, `slug`, `description`, `price_monthly`, `price_yearly`, `max_users`, `max_projects`, `max_storage_gb`, `features_json`) VALUES
(1, 'Starter', 'starter', 'Ideal for growing teams starting with organized task management and basic attendance tracking.', 29.00, 290.00, 15, 10, 10, '["Up to 15 Team Members", "10 Active Projects", "Multi-Factor Authentication (MFA)", "Attendance & Leave Tracking", "Standard Email Support"]'),
(2, 'Professional', 'professional', 'Perfect for mid-sized enterprises requiring multi-department oversight, advanced RBAC, and real-time collaboration.', 79.00, 790.00, 50, 50, 50, '["Up to 50 Team Members", "50 Active Projects", "Department & Team Scoping", "Real-Time Socket.IO Live Updates", "Advanced Leave Quota Allocations", "Priority Support"]'),
(3, 'Enterprise', 'enterprise', 'Unlimited scaling for large organizations needing complete data control, custom workflows, and full API access.', 199.00, 1990.00, 999999, 999999, 500, '["Unlimited Team Members", "Unlimited Active Projects", "Complete Database Isolation", "Custom Roles & Granular Permissions", "Full OpenAPI Swagger Portal", "Dedicated 24/7 SLA Support"]');
UNLOCK TABLES;

SET FOREIGN_KEY_CHECKS = 1;
