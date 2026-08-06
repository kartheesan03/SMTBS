SET sql_mode = '';
SET FOREIGN_KEY_CHECKS = 0;
-- ============================================================
-- SMTBS MySQL Export
-- Generated: 2026-08-06T07:04:17.529Z
-- Source: local SQLite database
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- Table: AIChatMessages
DROP TABLE IF EXISTS `AIChatMessages`;
CREATE TABLE `AIChatMessages` (
  `id` INT,
  `sessionId` INT NOT NULL,
  `role` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `actionTaken` TEXT,
  `sqlQuery` TEXT,
  `chartData` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: AIChatSessions
DROP TABLE IF EXISTS `AIChatSessions`;
CREATE TABLE `AIChatSessions` (
  `id` INT,
  `userId` INT NOT NULL,
  `title` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Attendance
DROP TABLE IF EXISTS `Attendance`;
CREATE TABLE `Attendance` (
  `id` INT,
  `userId` INT NOT NULL,
  `employeeId` INT,
  `role` TEXT,
  `date` DATE,
  `status` TEXT,
  `shift` TEXT,
  `checkInTime` TEXT,
  `checkOutTime` TEXT,
  `totalHours` DOUBLE,
  `location` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Attendance` (`id`, `userId`, `employeeId`, `role`, `date`, `status`, `shift`, `checkInTime`, `checkOutTime`, `totalHours`, `location`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 1, '2024-01-01 00:00:00', '2026-08-06', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (2, 3, 2, '2024-01-01 00:00:00', '2026-08-06', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (3, 5, 3, '2024-01-01 00:00:00', '2026-08-06', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (4, 9, 4, '2024-01-01 00:00:00', '2026-08-06', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (5, 7, 5, '2024-01-01 00:00:00', '2026-08-06', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (6, 1, 1, '2024-01-01 00:00:00', '2026-08-05', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (7, 3, 2, '2024-01-01 00:00:00', '2026-08-05', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (8, 5, 3, '2024-01-01 00:00:00', '2026-08-05', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (9, 9, 4, '2024-01-01 00:00:00', '2026-08-05', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (10, 7, 5, '2024-01-01 00:00:00', '2026-08-05', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (11, 1, 1, '2024-01-01 00:00:00', '2026-08-04', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (12, 3, 2, '2024-01-01 00:00:00', '2026-08-04', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (13, 5, 3, '2024-01-01 00:00:00', '2026-08-04', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (14, 9, 4, '2024-01-01 00:00:00', '2026-08-04', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (15, 7, 5, '2024-01-01 00:00:00', '2026-08-04', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (16, 1, 1, '2024-01-01 00:00:00', '2026-08-03', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (17, 3, 2, '2024-01-01 00:00:00', '2026-08-03', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (18, 5, 3, '2024-01-01 00:00:00', '2026-08-03', 'Leave', 'Day', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (19, 9, 4, '2024-01-01 00:00:00', '2026-08-03', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (20, 7, 5, '2024-01-01 00:00:00', '2026-08-03', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (21, 1, 1, '2024-01-01 00:00:00', '2026-07-31', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (22, 3, 2, '2024-01-01 00:00:00', '2026-07-31', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (23, 5, 3, '2024-01-01 00:00:00', '2026-07-31', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (24, 9, 4, '2024-01-01 00:00:00', '2026-07-31', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (25, 7, 5, '2024-01-01 00:00:00', '2026-07-31', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (26, 1, 1, '2024-01-01 00:00:00', '2026-07-30', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (27, 3, 2, '2024-01-01 00:00:00', '2026-07-30', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (28, 5, 3, '2024-01-01 00:00:00', '2026-07-30', 'Late', 'Day', '10:15 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (29, 9, 4, '2024-01-01 00:00:00', '2026-07-30', 'Leave', 'Day', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (30, 7, 5, '2024-01-01 00:00:00', '2026-07-30', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (31, 1, 1, '2024-01-01 00:00:00', '2026-07-29', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (32, 3, 2, '2024-01-01 00:00:00', '2026-07-29', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (33, 5, 3, '2024-01-01 00:00:00', '2026-07-29', 'Late', 'Day', '10:15 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (34, 9, 4, '2024-01-01 00:00:00', '2026-07-29', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (35, 7, 5, '2024-01-01 00:00:00', '2026-07-29', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (36, 1, 1, '2024-01-01 00:00:00', '2026-07-28', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (37, 3, 2, '2024-01-01 00:00:00', '2026-07-28', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (38, 5, 3, '2024-01-01 00:00:00', '2026-07-28', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (39, 9, 4, '2024-01-01 00:00:00', '2026-07-28', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (40, 7, 5, '2024-01-01 00:00:00', '2026-07-28', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (41, 1, 1, '2024-01-01 00:00:00', '2026-07-27', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (42, 3, 2, '2024-01-01 00:00:00', '2026-07-27', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (43, 5, 3, '2024-01-01 00:00:00', '2026-07-27', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (44, 9, 4, '2024-01-01 00:00:00', '2026-07-27', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (45, 7, 5, '2024-01-01 00:00:00', '2026-07-27', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (46, 1, 1, '2024-01-01 00:00:00', '2026-07-24', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (47, 3, 2, '2024-01-01 00:00:00', '2026-07-24', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (48, 5, 3, '2024-01-01 00:00:00', '2026-07-24', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (49, 9, 4, '2024-01-01 00:00:00', '2026-07-24', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (50, 7, 5, '2024-01-01 00:00:00', '2026-07-24', 'Present', 'Day', '09:00 AM', '06:00 PM', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '');

-- Table: AuditLog
DROP TABLE IF EXISTS `AuditLog`;
CREATE TABLE `AuditLog` (
  `id` INT,
  `userId` INT,
  `userName` TEXT,
  `action` TEXT NOT NULL,
  `module` TEXT NOT NULL,
  `targetId` INT,
  `description` TEXT,
  `changes` TEXT,
  `ipAddress` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `AuditLog` (`id`, `userId`, `userName`, `action`, `module`, `targetId`, `description`, `changes`, `ipAddress`, `createdAt`, `updatedAt`) VALUES
  (1, 1, '2024-01-01 00:00:00', 'CREATE', 'System', 1, 'System initialized and seeded data.', '2024-01-01 00:00:00', '127.0.0.1', '2024-01-01 00:00:00', '');

-- Table: Backup
DROP TABLE IF EXISTS `Backup`;
CREATE TABLE `Backup` (
  `id` INT,
  `backupName` TEXT NOT NULL,
  `backupType` TEXT NOT NULL,
  `filePath` TEXT NOT NULL,
  `fileSize` TEXT,
  `createdById` INT,
  `status` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: BackupSchedule
DROP TABLE IF EXISTS `BackupSchedule`;
CREATE TABLE `BackupSchedule` (
  `id` INT,
  `frequency` TEXT,
  `time` TEXT,
  `storage` TEXT,
  `enabled` INT DEFAULT 1,
  `keepLast` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Candidate
DROP TABLE IF EXISTS `Candidate`;
CREATE TABLE `Candidate` (
  `id` INT,
  `jobId` INT NOT NULL,
  `name` TEXT NOT NULL,
  `email` TEXT,
  `phone` TEXT,
  `stage` TEXT,
  `source` TEXT,
  `notes` TEXT,
  `rating` INT DEFAULT '0',
  `appliedAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: CommunicationLog
DROP TABLE IF EXISTS `CommunicationLog`;
CREATE TABLE `CommunicationLog` (
  `id` INT,
  `customerId` INT NOT NULL,
  `type` TEXT NOT NULL,
  `subject` TEXT NOT NULL,
  `notes` TEXT,
  `contactDate` DATETIME,
  `createdById` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `CommunicationLog` (`id`, `customerId`, `type`, `subject`, `notes`, `contactDate`, `createdById`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 'Call', 'Requirement Gathering', 'Discussed monthly requirement of TMT bars.', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (2, 2, 'Email', 'Invoice Followup', 'Sent invoice for the recent order.', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '');

-- Table: Customer
DROP TABLE IF EXISTS `Customer`;
CREATE TABLE `Customer` (
  `id` INT,
  `name` TEXT NOT NULL,
  `userId` INT,
  `email` TEXT,
  `phone` TEXT,
  `company` TEXT,
  `customerType` TEXT,
  `address` TEXT,
  `industry` TEXT,
  `website` TEXT,
  `notes` TEXT,
  `status` TEXT,
  `gstNumber` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  `createdByField` INT,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Customer` (`id`, `name`, `userId`, `email`, `phone`, `company`, `customerType`, `address`, `industry`, `website`, `notes`, `status`, `gstNumber`, `createdAt`, `updatedAt`, `createdByField`) VALUES
  (1, 'Kovai Builders Pvt Ltd', '2024-01-01 00:00:00', 'info@kovaibuilders.in', '9843210001', 'Kovai Builders Pvt Ltd', 'Individual', 'Race Course Road, Coimbatore, Tamil Nadu 641018', 'Real Estate', 'kovaibuilders.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 7),
  (2, 'Madurai Manufacturing Corp', '2024-01-01 00:00:00', 'orders@maduraimfg.co.in', '9843210002', 'Madurai Manufacturing Corp', 'Individual', '45, Industrial Area, Kappalur, Madurai, Tamil Nadu 625008', 'Manufacturing', 'maduraimfg.co.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 7),
  (3, 'Trichy Engineering Works', '2024-01-01 00:00:00', 'contact@trichyengg.in', '9843210003', 'Trichy Engineering Works', 'Individual', '12, BHEL Township, Tiruchirappalli, Tamil Nadu 620014', 'Heavy Engineering', 'trichyengg.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 7),
  (4, 'Salem Steel Fabricators', '2024-01-01 00:00:00', 'admin@salemsteel.in', '9843210004', 'Salem Steel Fabricators', 'Individual', '88, Five Roads, Salem, Tamil Nadu 636004', 'Steel Fabrication', 'salemsteel.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 8),
  (5, 'Tirupur Textiles & Infra', '2024-01-01 00:00:00', 'info@tirupurtextiles.in', '9843210005', 'Tirupur Textiles & Infra', 'Individual', 'Kangeyam Road, Tirupur, Tamil Nadu 641604', 'Textile & Construction', 'tirupurtextiles.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 8),
  (6, 'Nellai Construction Company', '2024-01-01 00:00:00', 'nellai@nellaicc.in', '9843210006', 'Nellai Construction Co', 'Individual', '34, South Bypass, Tirunelveli, Tamil Nadu 627001', 'Construction', 'nellaicc.in', '2024-01-01 00:00:00', 'Pending Review', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 7),
  (7, 'Thanjavur Heritage Builders', '2024-01-01 00:00:00', 'heritage@thanjavurbuild.in', '9843210007', 'Thanjavur Heritage Builders', 'Individual', '5, Temple Street, Thanjavur, Tamil Nadu 613001', 'Heritage Construction', 'thanjavurbuild.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 8),
  (8, 'Vellore Tech Solutions', '2024-01-01 00:00:00', 'tech@velloretech.in', '9843210008', 'Vellore Tech Solutions', 'Individual', '22, Katpadi Road, Vellore, Tamil Nadu 632007', 'IT Infrastructure', 'velloretech.in', '2024-01-01 00:00:00', 'Active', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', 7);

-- Table: Employee
DROP TABLE IF EXISTS `Employee`;
CREATE TABLE `Employee` (
  `id` INT,
  `employeeId` TEXT NOT NULL,
  `userIdField` INT,
  `firstName` TEXT NOT NULL,
  `lastName` TEXT,
  `department` TEXT,
  `designation` TEXT,
  `salary` DOUBLE,
  `joinDate` DATETIME,
  `contact` TEXT,
  `phone` TEXT,
  `address` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Employee` (`id`, `employeeId`, `userIdField`, `firstName`, `lastName`, `department`, `designation`, `salary`, `joinDate`, `contact`, `phone`, `address`, `createdAt`, `updatedAt`) VALUES
  (1, 'EMP001', 1, 'System', 'Admin', 'Admin', 'Administrator', 75000, '2024-01-01 00:00:00', '9876543200', '2024-01-01 00:00:00', '1, Admin Block, Coimbatore, Tamil Nadu 641001', '2024-01-01 00:00:00', ''),
  (2, 'EMP002', 3, 'Priya', 'Devi', 'HR', 'HR Manager', 48000, '2024-01-01 00:00:00', '9876543214', '2024-01-01 00:00:00', '56, RS Puram, Coimbatore, Tamil Nadu 641002', '2024-01-01 00:00:00', ''),
  (3, 'EMP003', 5, 'Murugan', 'Selvam', 'Manager', 'Operations Manager', 55000, '2024-01-01 00:00:00', '9876543210', '2024-01-01 00:00:00', '12, Anna Nagar, Coimbatore, Tamil Nadu 641001', '2024-01-01 00:00:00', ''),
  (4, 'EMP004', 9, 'Rajesh', 'Kannan', 'Employee', 'Staff', 28000, '2024-01-01 00:00:00', '9876543216', '2024-01-01 00:00:00', '34, Singanallur, Coimbatore, Tamil Nadu 641005', '2024-01-01 00:00:00', ''),
  (5, 'EMP005', 7, 'Senthil', 'Kumar', 'Sales', 'Senior Sales Executive', 42000, '2024-01-01 00:00:00', '9876543212', '2024-01-01 00:00:00', '78, T. Nagar, Chennai, Tamil Nadu 600017', '2024-01-01 00:00:00', ''),
  (6, 'EMP006', 2, 'Meena', 'Sundar', 'Admin', 'Admin Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'admin2@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (7, 'EMP007', 4, 'Lakshmi', 'Narayanan', 'HR', 'HR Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'hr2@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (8, 'EMP008', 6, 'Anitha', 'Bala', 'Manager', 'Manager Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'manager2@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (9, 'EMP009', 8, 'Kavitha', 'Ramesh', 'Sales', 'Sales Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'sales2@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (10, 'EMP010', 10, 'Divya', 'Prakash', 'Employee', 'Employee Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'employee2@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (11, 'EMP011', 11, 'Venkatesh', 'Iyer', 'Employee', 'Employee Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'employee3@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', ''),
  (12, 'EMP012', 12, 'Saranya', 'Mohan', 'Employee', 'Employee Staff', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'employee4@smtbms.com', '0000000000', 'Office HQ', '2024-01-01 00:00:00', '');

-- Table: Holiday
DROP TABLE IF EXISTS `Holiday`;
CREATE TABLE `Holiday` (
  `id` INT,
  `name` TEXT NOT NULL,
  `date` DATE NOT NULL,
  `type` TEXT,
  `description` TEXT,
  `color` TEXT,
  `isRecurring` INT DEFAULT 0,
  `createdBy` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: JobPosting
DROP TABLE IF EXISTS `JobPosting`;
CREATE TABLE `JobPosting` (
  `id` INT,
  `title` TEXT NOT NULL,
  `department` TEXT,
  `location` TEXT,
  `type` TEXT,
  `status` TEXT,
  `description` TEXT,
  `requirements` TEXT,
  `salaryMin` INT,
  `salaryMax` INT,
  `deadline` DATE,
  `openings` INT DEFAULT '1',
  `createdBy` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Lead
DROP TABLE IF EXISTS `Lead`;
CREATE TABLE `Lead` (
  `id` INT,
  `name` TEXT NOT NULL,
  `companyName` TEXT,
  `email` TEXT,
  `phone` TEXT,
  `status` TEXT,
  `source` TEXT,
  `dealValue` DOUBLE DEFAULT '0',
  `notes` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Leave
DROP TABLE IF EXISTS `Leave`;
CREATE TABLE `Leave` (
  `id` INT,
  `employeeId` INT NOT NULL,
  `type` TEXT NOT NULL,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `reason` TEXT,
  `status` TEXT,
  `reviewedById` INT,
  `reviewNote` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Leave` (`id`, `employeeId`, `type`, `startDate`, `endDate`, `reason`, `status`, `reviewedById`, `reviewNote`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 'Sick', '2024-01-01 00:00:00', '', 'Fever and body pain', 'Approved', 3, 'Approved. Medical certificate received.', '2024-01-01 00:00:00', ''),
  (2, 2, 'Casual', '2024-01-01 00:00:00', '', 'Family function at Thanjavur', 'Approved', 3, 'Permitted.', '2024-01-01 00:00:00', ''),
  (3, 3, 'Annual', '2024-01-01 00:00:00', '', 'Family vacation to Kerala', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', '2024-01-01 00:00:00'),
  (4, 4, 'Sick', '2024-01-01 00:00:00', '', 'Dental appointment at KG Hospital, Coimbatore', 'Approved', 1, 'Half-day approved.', '2024-01-01 00:00:00', ''),
  (5, 5, 'Casual', '2024-01-01 00:00:00', '', 'Personal work - vehicle registration at RTO', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', '2024-01-01 00:00:00'),
  (6, 1, 'Unpaid', '2024-01-01 00:00:00', '', 'Village temple festival at Kumbakonam', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '', '2024-01-01 00:00:00');

-- Table: Material
DROP TABLE IF EXISTS `Material`;
CREATE TABLE `Material` (
  `id` INT,
  `name` TEXT NOT NULL,
  `sku` TEXT,
  `category` TEXT,
  `quantity` INT DEFAULT 0,
  `reservedQuantity` INT DEFAULT 0,
  `lowStockThreshold` INT DEFAULT 10,
  `unit` TEXT,
  `price` DOUBLE DEFAULT '0',
  `status` TEXT,
  `vendorId` INT,
  `latitude` DOUBLE,
  `longitude` DOUBLE,
  `isActive` INT DEFAULT 1,
  `condition` TEXT,
  `source` TEXT,
  `certifications` TEXT,
  `used_in` TEXT,
  `specs` TEXT,
  `images` TEXT,
  `warehouse` TEXT,
  `rack` TEXT,
  `shelf` TEXT,
  `location` TEXT,
  `gpsStatus` TEXT,
  `locationUpdatedAt` DATETIME DEFAULT NULL,
  `deliveryDestination` TEXT,
  `deliveryEta` DATETIME DEFAULT NULL,
  `deliveryDispatchedAt` DATETIME DEFAULT NULL,
  `deliveryCompletedAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Material` (`id`, `name`, `sku`, `category`, `quantity`, `reservedQuantity`, `lowStockThreshold`, `unit`, `price`, `status`, `vendorId`, `latitude`, `longitude`, `isActive`, `condition`, `source`, `certifications`, `used_in`, `specs`, `images`, `warehouse`, `rack`, `shelf`, `location`, `gpsStatus`, `locationUpdatedAt`, `deliveryDestination`, `deliveryEta`, `deliveryDispatchedAt`, `deliveryCompletedAt`, `createdAt`, `updatedAt`) VALUES
  (1, 'TMT Steel Bars (12mm)', 'TMT-001', 'Construction Steel', 500, 0, 100, 'kg', 62, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 1', 'Warehouse A / Shelf 1', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (2, 'MS Angle (50x50x6)', 'MSA-002', 'Structural Steel', 12, 0, 20, 'pcs', 850, 'Low Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 2', 'Warehouse A / Shelf 2', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (3, 'Copper Wire (2.5 sqmm)', 'CW-003', 'Electrical', 2000, 0, 500, 'm', 18, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 3', 'Warehouse A / Shelf 3', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (4, 'GI Pipes (1 inch)', 'GIP-004', 'Plumbing', 150, 0, 30, 'pcs', 420, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 4', 'Warehouse A / Shelf 4', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (5, 'Aluminum Sheet (1mm)', 'ALS-005', 'Sheet Metal', 5, 0, 10, 'pcs', 1800, 'Low Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 5', 'Warehouse A / Shelf 5', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (6, 'PVC Conduit Pipe (25mm)', 'PVC-006', 'Electrical', 300, 0, 50, 'pcs', 45, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse B', '2024-01-01 00:00:00', 'Shelf 1', 'Warehouse B / Shelf 1', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (7, 'Welding Rod (E6013)', 'WR-007', 'Consumables', 0, 0, 50, 'pcs', 5, 'Out of Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse B', '2024-01-01 00:00:00', 'Shelf 2', 'Warehouse B / Shelf 2', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (8, 'Cement (OPC 53 Grade)', 'CEM-008', 'Construction', 200, 0, 50, 'bags', 380, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse B', '2024-01-01 00:00:00', 'Shelf 3', 'Warehouse B / Shelf 3', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (9, 'Sand (River Sand)', 'SND-009', 'Construction', 40, 0, 20, 'cubic ft', 65, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse B', '2024-01-01 00:00:00', 'Shelf 4', 'Warehouse B / Shelf 4', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (10, 'Brass Fittings (0.5 inch)', 'BRF-010', 'Plumbing', 7, 0, 15, 'pcs', 120, 'Low Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse B', '2024-01-01 00:00:00', 'Shelf 5', 'Warehouse B / Shelf 5', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (11, 'SS Sheet (304 Grade)', 'SS-011', 'Sheet Metal', 25, 0, 5, 'pcs', 3500, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 1', 'Warehouse A / Shelf 1', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (12, 'MCB Switch (32A)', 'MCB-012', 'Electrical', 80, 0, 20, 'pcs', 250, 'In Stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 1, 'New', '2024-01-01 00:00:00', '[]', '[]', '{}', '[]', 'Warehouse A', '2024-01-01 00:00:00', 'Shelf 2', 'Warehouse A / Shelf 2', 'At Warehouse', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '');

-- Table: MaterialMovement
DROP TABLE IF EXISTS `MaterialMovement`;
CREATE TABLE `MaterialMovement` (
  `id` INT,
  `materialId` INT NOT NULL,
  `type` TEXT NOT NULL,
  `quantity` INT NOT NULL,
  `previousQuantity` INT,
  `newQuantity` INT,
  `reason` TEXT,
  `referenceOrderId` INT,
  `performedById` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `MaterialMovement` (`id`, `materialId`, `type`, `quantity`, `previousQuantity`, `newQuantity`, `reason`, `referenceOrderId`, `performedById`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 'In', 50, 200, 250, 'Initial Stock Audit', '2024-01-01 00:00:00', 1, '2024-01-01 00:00:00', ''),
  (2, 2, 'Out', 10, 100, 90, 'Sales Order SO-2026-001', '2024-01-01 00:00:00', 7, '2024-01-01 00:00:00', '');

-- Table: Notification
DROP TABLE IF EXISTS `Notification`;
CREATE TABLE `Notification` (
  `id` INT,
  `module` TEXT NOT NULL,
  `referenceId` TEXT,
  `userId` INT,
  `role` TEXT,
  `title` TEXT NOT NULL,
  `message` TEXT NOT NULL,
  `type` TEXT,
  `status` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Notification` (`id`, `module`, `referenceId`, `userId`, `role`, `title`, `message`, `type`, `status`, `createdAt`, `updatedAt`) VALUES
  (1, 'stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Low Stock Alert - MS Angle', 'MS Angle (50x50x6) stock is at 12 pcs, below the threshold of 20. Place a purchase order immediately.', 'warning', 'unread', '2024-01-01 00:00:00', ''),
  (2, 'stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Out of Stock - Welding Rod', 'Welding Rod (E6013) is completely out of stock. Production line may be affected.', 'error', 'unread', '2024-01-01 00:00:00', ''),
  (3, 'stock', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Low Stock Alert - Aluminum Sheet', 'Aluminum Sheet (1mm) stock is at 5 pcs, below the threshold of 10.', 'warning', 'unread', '2024-01-01 00:00:00', ''),
  (4, 'hr', '2024-01-01 00:00:00', 1, '2024-01-01 00:00:00', 'Leave Request Pending', 'Divya Prakash has requested 7 days of annual leave starting next week. Review required.', 'info', 'unread', '2024-01-01 00:00:00', ''),
  (5, 'hr', '2024-01-01 00:00:00', 1, '2024-01-01 00:00:00', 'Aug 2026 Payroll Ready for Approval', '10 salary slips for Aug 2026 have been generated and are pending admin approval.', 'info', 'unread', '2024-01-01 00:00:00', ''),
  (6, 'order', '2024-01-01 00:00:00', 5, '2024-01-01 00:00:00', 'Purchase Order Delivered', 'PO-2026-001 from Sri Lakshmi Steel Traders has been delivered and verified. 500 kg TMT Steel added to inventory.', 'success', 'unread', '2024-01-01 00:00:00', ''),
  (7, 'general', '2024-01-01 00:00:00', 7, '2024-01-01 00:00:00', 'New Lead Assigned', 'New lead "Ramanathapuram Fisheries" has been assigned to you. Estimated deal value: Rs.4,10,000.', 'info', 'unread', '2024-01-01 00:00:00', ''),
  (8, 'system', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'System Maintenance Notice', 'SMTBMS will undergo scheduled maintenance on Sunday 12:00 AM - 4:00 AM IST. Plan your work accordingly.', 'info', 'unread', '2024-01-01 00:00:00', '');

-- Table: Order
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order` (
  `id` INT,
  `orderNumber` TEXT,
  `customerId` INT,
  `leadId` INT,
  `customerModel` TEXT,
  `vendorId` INT,
  `items` TEXT,
  `totalAmount` DOUBLE,
  `status` TEXT,
  `approvalStatus` TEXT,
  `managerApproval` TEXT,
  `employeeApproval` TEXT,
  `deliveryStatus` TEXT,
  `employeeId` INT,
  `liveLocation` TEXT,
  `routePath` TEXT,
  `deliveryETA` DATETIME,
  `distanceRemaining` DOUBLE,
  `trackingStatus` TEXT,
  `sourcedLocation` TEXT,
  `deliveryNotes` TEXT,
  `holdReason` TEXT,
  `approvedById` INT,
  `approvedDate` DATETIME,
  `deliveryDate` DATETIME,
  `deliveredAt` DATETIME,
  `orderDate` DATETIME,
  `expectedDeliveryDate` DATETIME,
  `invoiceNumber` TEXT,
  `invoiceDate` DATETIME,
  `invoiceDueDate` DATETIME,
  `paymentStatus` TEXT,
  `invoiceGenerated` INT DEFAULT 0,
  `orderType` TEXT NOT NULL,
  `createdById` INT,
  `updatedById` INT,
  `notes` TEXT,
  `grandTotal` DOUBLE DEFAULT '0',
  `trackingTimeline` TEXT,
  `workflow` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Order` (`id`, `orderNumber`, `customerId`, `leadId`, `customerModel`, `vendorId`, `items`, `totalAmount`, `status`, `approvalStatus`, `managerApproval`, `employeeApproval`, `deliveryStatus`, `employeeId`, `liveLocation`, `routePath`, `deliveryETA`, `distanceRemaining`, `trackingStatus`, `sourcedLocation`, `deliveryNotes`, `holdReason`, `approvedById`, `approvedDate`, `deliveryDate`, `deliveredAt`, `orderDate`, `expectedDeliveryDate`, `invoiceNumber`, `invoiceDate`, `invoiceDueDate`, `paymentStatus`, `invoiceGenerated`, `orderType`, `createdById`, `updatedById`, `notes`, `grandTotal`, `trackingTimeline`, `workflow`, `createdAt`, `updatedAt`) VALUES
  (1, 'SO-2026-001', 1, '2024-01-01 00:00:00', 'Customer', '2024-01-01 00:00:00', '[{"material":1,"quantity":200,"price":62},{"material":8,"quantity":100,"price":380}]', 50400, 'Confirmed', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'sales', 7, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (2, 'SO-2026-002', 2, '2024-01-01 00:00:00', 'Customer', '2024-01-01 00:00:00', '[{"material":11,"quantity":10,"price":3500},{"material":3,"quantity":500,"price":18}]', 44000, 'Shipped', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'sales', 7, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (3, 'SO-2026-003', 3, '2024-01-01 00:00:00', 'Customer', '2024-01-01 00:00:00', '[{"material":2,"quantity":30,"price":850}]', 25500, 'Pending', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'sales', 8, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (4, 'SO-2026-004', 4, '2024-01-01 00:00:00', 'Customer', '2024-01-01 00:00:00', '[{"material":1,"quantity":100,"price":62},{"material":7,"quantity":200,"price":5}]', 7200, 'Confirmed', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'sales', 8, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (5, 'SO-2026-005', 5, '2024-01-01 00:00:00', 'Customer', '2024-01-01 00:00:00', '[{"material":4,"quantity":50,"price":420},{"material":6,"quantity":100,"price":45}]', 25500, 'Delivered', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'sales', 7, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (6, 'PO-2026-001', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Customer', 1, '[{"material":1,"quantity":500,"price":55},{"material":2,"quantity":50,"price":720}]', 63500, 'Delivered', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'purchase', 5, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (7, 'PO-2026-002', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Customer', 2, '[{"material":3,"quantity":1000,"price":15},{"material":12,"quantity":50,"price":200}]', 25000, 'Confirmed', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'purchase', 5, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (8, 'PO-2026-003', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Customer', 4, '[{"material":8,"quantity":200,"price":340}]', 68000, 'Awaiting Approval', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'purchase', 6, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (9, 'PO-2026-004', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Customer', 6, '[{"material":7,"quantity":500,"price":3.5}]', 1750, 'Approved', 'Pending', 'Pending', 'Not Started', 'Pending', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Not Started', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Pending', 0, 'purchase', 5, '2024-01-01 00:00:00', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '');

-- Table: PurchaseRequest
DROP TABLE IF EXISTS `PurchaseRequest`;
CREATE TABLE `PurchaseRequest` (
  `id` INT,
  `purchaseRequestId` TEXT NOT NULL,
  `orderId` INT,
  `vendorId` INT,
  `items` TEXT NOT NULL,
  `status` TEXT,
  `priority` TEXT,
  `requestedById` INT,
  `notes` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Quotation
DROP TABLE IF EXISTS `Quotation`;
CREATE TABLE `Quotation` (
  `id` INT,
  `quotationNumber` TEXT NOT NULL,
  `customer` INT NOT NULL,
  `customerName` TEXT NOT NULL,
  `date` DATETIME,
  `validUntil` DATETIME NOT NULL,
  `items` TEXT,
  `subTotal` DOUBLE NOT NULL,
  `taxAmount` DOUBLE DEFAULT '0',
  `grandTotal` DOUBLE NOT NULL,
  `status` TEXT,
  `notes` TEXT,
  `termsAndConditions` TEXT,
  `createdBy` INT,
  `createdByName` TEXT,
  `salesOrderId` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: RestoreLog
DROP TABLE IF EXISTS `RestoreLog`;
CREATE TABLE `RestoreLog` (
  `id` INT,
  `backupIdField` INT NOT NULL,
  `restoredById` INT NOT NULL,
  `status` TEXT,
  `remarks` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Role
DROP TABLE IF EXISTS `Role`;
CREATE TABLE `Role` (
  `id` INT,
  `name` TEXT NOT NULL,
  `description` TEXT,
  `permissions` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Salary
DROP TABLE IF EXISTS `Salary`;
CREATE TABLE `Salary` (
  `id` INT,
  `employeeId` INT NOT NULL,
  `month` TEXT NOT NULL,
  `basicSalary` DOUBLE NOT NULL,
  `allowances` DOUBLE DEFAULT '0',
  `deductions` DOUBLE DEFAULT '0',
  `netSalary` DOUBLE NOT NULL,
  `status` TEXT,
  `paymentDate` DATETIME,
  `transactionId` TEXT,
  `paidBy` INT,
  `paymentMethod` TEXT,
  `paymentDetails` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Salary` (`id`, `employeeId`, `month`, `basicSalary`, `allowances`, `deductions`, `netSalary`, `status`, `paymentDate`, `transactionId`, `paidBy`, `paymentMethod`, `paymentDetails`, `createdAt`, `updatedAt`) VALUES
  (1, 1, 'Jul 2026', 75000, 11250, 3750, 82500, 'Paid', '2024-01-01 00:00:00', 'TXN-JUL-EMP001', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (2, 2, 'Jul 2026', 48000, 7200, 2400, 52800, 'Paid', '2024-01-01 00:00:00', 'TXN-JUL-EMP002', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (3, 3, 'Jul 2026', 55000, 8250, 2750, 60500, 'Paid', '2024-01-01 00:00:00', 'TXN-JUL-EMP003', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (4, 4, 'Jul 2026', 28000, 4200, 1400, 30800, 'Paid', '2024-01-01 00:00:00', 'TXN-JUL-EMP004', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (5, 5, 'Jul 2026', 42000, 6300, 2100, 46200, 'Paid', '2024-01-01 00:00:00', 'TXN-JUL-EMP005', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (6, 1, 'Aug 2026', 75000, 11250, 3000, 83250, 'Awaiting Approval', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (7, 2, 'Aug 2026', 48000, 7200, 1920, 53280, 'Awaiting Approval', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (8, 3, 'Aug 2026', 55000, 8250, 2200, 61050, 'Awaiting Approval', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (9, 4, 'Aug 2026', 28000, 4200, 1120, 31080, 'Awaiting Approval', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', ''),
  (10, 5, 'Aug 2026', 42000, 6300, 1680, 46620, 'Awaiting Approval', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '');

-- Table: SalesGoal
DROP TABLE IF EXISTS `SalesGoal`;
CREATE TABLE `SalesGoal` (
  `id` INT,
  `assignedTo` INT NOT NULL,
  `period` TEXT,
  `startDate` DATETIME NOT NULL,
  `endDate` DATETIME NOT NULL,
  `targetAmount` DOUBLE DEFAULT '0',
  `targetOrders` INT DEFAULT 0,
  `createdBy` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: StockRequest
DROP TABLE IF EXISTS `StockRequest`;
CREATE TABLE `StockRequest` (
  `id` INT,
  `materialId` INT NOT NULL,
  `employeeId` INT NOT NULL,
  `managerId` INT,
  `currentStock` INT NOT NULL DEFAULT 0,
  `requiredQuantity` INT NOT NULL DEFAULT 1,
  `reason` TEXT,
  `managerMessage` TEXT,
  `status` TEXT,
  `orderId` INT,
  `history` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: Task
DROP TABLE IF EXISTS `Task`;
CREATE TABLE `Task` (
  `id` INT,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `assignedTo` TEXT,
  `assignedById` INT,
  `completions` TEXT,
  `priority` TEXT,
  `dueDate` DATETIME,
  `isBroadcast` INT DEFAULT 0,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Task` (`id`, `title`, `description`, `assignedTo`, `assignedById`, `completions`, `priority`, `dueDate`, `isBroadcast`, `createdAt`, `updatedAt`) VALUES
  (1, 'Organize Warehouse for TMT Steel Delivery', 'Clear section B in the Singanallur warehouse to accommodate 500 kg TMT steel rods arriving from Sri Lakshmi Steel Traders.', '[9]', 5, '[{"user":9,"status":"In Progress"}]', 'High', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (2, 'Follow up with Hosur Auto Components', 'Hosur Auto requested revised quotation for SS Sheets and Copper Wires. Prepare and send updated pricing.', '[7]', 5, '[{"user":7,"status":"Pending"}]', 'High', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (3, 'Conduct Monthly Safety Drill - Coimbatore Factory', 'All factory employees must participate in the fire safety drill at 10:00 AM on Monday at the Singanallur factory premises.', '[5,6,9,10,11,12]', 1, '[{"user":5,"status":"Completed"},{"user":6,"status":"Completed"},{"user":9,"status":"Completed"},{"user":10,"status":"Completed"},{"user":11,"status":"Completed"},{"user":12,"status":"Completed"}]', 'Medium', '2024-01-01 00:00:00', 1, '2024-01-01 00:00:00', ''),
  (4, 'Physical Stock Audit - Low Stock Items', 'Conduct physical count verification for MS Angle, Aluminum Sheet, and Brass Fittings which are below threshold.', '[9,10]', 5, '[{"user":9,"status":"Completed"},{"user":10,"status":"In Progress"}]', 'High', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (5, 'Submit Aug 2026 Departmental Reports', 'All department heads must submit monthly performance summaries to the admin office by end of this week.', '[5,6,3,7]', 1, '[{"user":5,"status":"Pending"},{"user":6,"status":"In Progress"},{"user":3,"status":"Completed"},{"user":7,"status":"Pending"}]', 'Medium', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (6, 'Prepare Quotation for Nellai Construction', 'Nellai Construction Company has requested bulk quotation for TMT bars, cement, and sand. Prepare and send within 2 days.', '[8]', 5, '[{"user":8,"status":"Pending"}]', 'Medium', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (7, 'Update Employee Contact Records', 'Verify and update all employee phone numbers and emergency contacts in the HRMS system.', '[3,4]', 1, '[{"user":3,"status":"In Progress"},{"user":4,"status":"Pending"}]', 'Low', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (8, 'Dispatch Coordination - Salem Steel Order', 'Coordinate with logistics partner for SO-2026-004 delivery to Salem Steel Fabricators. Confirm dispatch date and tracking.', '[11]', 6, '[{"user":11,"status":"In Progress"}]', 'High', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '');

-- Table: Test
DROP TABLE IF EXISTS `Test`;
CREATE TABLE `Test` (
  `id` INT,
  `name` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Test` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
  (1, 'Hello', '2024-01-01 00:00:00', '');

-- Table: Ticket
DROP TABLE IF EXISTS `Ticket`;
CREATE TABLE `Ticket` (
  `id` INT,
  `ticketNumber` TEXT NOT NULL,
  `customerId` INT,
  `leadId` INT,
  `customerModel` TEXT,
  `subject` TEXT NOT NULL,
  `description` TEXT NOT NULL,
  `priority` TEXT,
  `status` TEXT,
  `category` TEXT,
  `assignedToId` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Ticket` (`id`, `ticketNumber`, `customerId`, `leadId`, `customerModel`, `subject`, `description`, `priority`, `status`, `category`, `assignedToId`, `createdAt`, `updatedAt`) VALUES
  (1, 'TIC-203512', 1, '2024-01-01 00:00:00', 'Customer', 'Delayed cement delivery', 'Order SO-2026-001 has cement bags which have not arrived at Coimbatore warehouse yet.', 'High', 'Open', 'General', 1, '2024-01-01 00:00:00', ''),
  (2, 'TIC-948123', 2, '2024-01-01 00:00:00', 'Customer', 'Wrong SKU invoice quantity', 'Invoice total counts 12 SS Sheets, but only 10 were delivered. Adjust credit ledger.', 'Medium', 'In Progress', 'General', 5, '2024-01-01 00:00:00', ''),
  (3, 'TIC-731054', 3, '2024-01-01 00:00:00', 'Customer', 'Assistance with vendor details', 'Require complete contact person portfolio for Sri Lakshmi Steel Traders.', 'Low', 'Resolved', 'General', 3, '2024-01-01 00:00:00', '');

-- Table: TrainingCourse
DROP TABLE IF EXISTS `TrainingCourse`;
CREATE TABLE `TrainingCourse` (
  `id` INT,
  `title` TEXT NOT NULL,
  `description` TEXT,
  `category` TEXT,
  `instructor` TEXT,
  `duration` TEXT,
  `capacity` INT DEFAULT '30',
  `status` TEXT,
  `badge` TEXT,
  `rating` DOUBLE DEFAULT '0',
  `color` TEXT,
  `dueDate` DATE,
  `createdBy` INT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: TrainingEnrollment
DROP TABLE IF EXISTS `TrainingEnrollment`;
CREATE TABLE `TrainingEnrollment` (
  `id` INT,
  `courseId` INT NOT NULL,
  `userId` INT NOT NULL,
  `progress` INT DEFAULT '0',
  `status` TEXT,
  `completedAt` DATETIME,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: User
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` INT,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `password` TEXT,
  `phone` TEXT,
  `googleId` TEXT,
  `picture` TEXT,
  `role` TEXT,
  `active` INT DEFAULT 1,
  `isProfileComplete` INT DEFAULT 0,
  `provider` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `User` (`id`, `name`, `email`, `password`, `phone`, `googleId`, `picture`, `role`, `active`, `isProfileComplete`, `provider`, `createdAt`, `updatedAt`) VALUES
  (1, 'Karthikeyan Rajan', 'admin@smtbms.com', '$2b$10$z/RRsNAyBEx3mfMzkAlq/uVSUWJC3.wDIEbqSr/zYfM6waDtCwLv.', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Admin', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (2, 'Meena Sundar', 'admin2@smtbms.com', '$2b$10$ifB8TpVBfRte9ZV9Uw/kOeS.gRQYGVTD/XqjiuFHbR98vk0cOU46m', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Admin', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (3, 'Priya Devi', 'hr@smtbms.com', '$2b$10$6lTipiL7jMtCDBLd4geBDOGV32PyltTR43TbM1GFVD8PQIAaEJdJG', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'HR', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (4, 'Lakshmi Narayanan', 'hr2@smtbms.com', '$2b$10$aQzWkhgHaP8eWzwHiBLP0ueG4ofS5YPQKVKFLkM71yLT/cGKC1mNO', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'HR', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (5, 'Murugan Selvam', 'manager@smtbms.com', '$2b$10$58LLPETI5CNEJ.IzAutJkOZVFyAgknpE6hpu5sK9D7ZynIpPZ19Uu', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Manager', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (6, 'Anitha Bala', 'manager2@smtbms.com', '$2b$10$kclOrzjrok8bmfjqOvVpsudYlATZ5buW4kpRpmcNVq2uvN37rxs2S', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Manager', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (7, 'Senthil Kumar', 'sales@smtbms.com', '$2b$10$stp4DCjH9SpXhlLqkDROW.nPesgymzTDlQtaBd9sLp1H/g6QqaokK', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Sales', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (8, 'Kavitha Ramesh', 'sales2@smtbms.com', '$2b$10$zBTZ/qJMk/68XA3R0.txser67XcVEqJZ81pQu/EXYMetH7XlplzX2', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Sales', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (9, 'Rajesh Kannan', 'employee@smtbms.com', '$2b$10$0IarMGAh5Z67/AW3tN0VIesl4iKQanXWmVq8gMb2IbD4CkJJJuoDK', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Employee', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (10, 'Divya Prakash', 'employee2@smtbms.com', '$2b$10$iXkouS2I0WhH3mRBlCyooeQx.ihBpAqK6vJh9OpKrJDet6pxP3hvG', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Employee', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (11, 'Venkatesh Iyer', 'employee3@smtbms.com', '$2b$10$03sG2TDSmGNH5zeX7Beykumb/j/5T0r95Z84yfDpvpOtrDsoIc5my', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Employee', 1, 0, 'local', '2024-01-01 00:00:00', ''),
  (12, 'Saranya Mohan', 'employee4@smtbms.com', '$2b$10$TH41Dz91ZHTuGul9uQJWXuTVxdhQCecIESguAEJJaH1XKbHYNSIPe', '2024-01-01 00:00:00', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Employee', 1, 0, 'local', '2024-01-01 00:00:00', '');

-- Table: Vendor
DROP TABLE IF EXISTS `Vendor`;
CREATE TABLE `Vendor` (
  `id` INT,
  `name` TEXT NOT NULL,
  `userId` INT,
  `contactPerson` TEXT,
  `email` TEXT,
  `phone` TEXT,
  `address` TEXT,
  `category` TEXT,
  `gstNumber` TEXT,
  `website` TEXT,
  `status` TEXT,
  `materialsSupplied` TEXT,
  `rating` DOUBLE DEFAULT '0',
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Vendor` (`id`, `name`, `userId`, `contactPerson`, `email`, `phone`, `address`, `category`, `gstNumber`, `website`, `status`, `materialsSupplied`, `rating`, `createdAt`, `updatedAt`) VALUES
  (1, 'Sri Lakshmi Steel Traders', '2024-01-01 00:00:00', 'Ravi Shankar', 'ravi@srilakshmisteel.in', '9865432100', 'SIDCO Industrial Estate, Coimbatore, Tamil Nadu 641021', 'Steel & Metals', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (2, 'Kumaran Electricals', '2024-01-01 00:00:00', 'Kumaran M', 'kumaran@kumaranelec.in', '9865432101', '32, Mettupalayam Road, Coimbatore, Tamil Nadu 641043', 'Electrical', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (3, 'Thirumurugan Pipes & Fittings', '2024-01-01 00:00:00', 'Thirumurugan P', 'info@tmpipes.co.in', '9865432102', '15, Avinashi Road, Tirupur, Tamil Nadu 641602', 'Plumbing', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (4, 'Madurai Cement Depot', '2024-01-01 00:00:00', 'Pandian S', 'pandian@maduraicement.in', '9865432103', '78, Bypass Road, Madurai, Tamil Nadu 625016', 'Construction', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (5, 'Coimbatore Sheet Metal Works', '2024-01-01 00:00:00', 'Balamurugan K', 'bala@cbesheetmetal.in', '9865432104', '5, Ganapathy, Coimbatore, Tamil Nadu 641006', 'Sheet Metal', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', ''),
  (6, 'Erode Welding Supplies', '2024-01-01 00:00:00', 'Saravanan R', 'saravanan@erodeweld.in', '9865432105', '21, Perundurai Road, Erode, Tamil Nadu 638052', 'Consumables', '2024-01-01 00:00:00', '2024-01-01 00:00:00', 'Vendor Created', '2024-01-01 00:00:00', 0, '2024-01-01 00:00:00', '');

-- Table: ai_copilot_logs
DROP TABLE IF EXISTS `ai_copilot_logs`;
CREATE TABLE `ai_copilot_logs` (
  `id` INT,
  `userId` INT NOT NULL,
  `role` TEXT NOT NULL,
  `question` TEXT NOT NULL,
  `generatedSql` TEXT,
  `executionTimeMs` INT,
  `success` INT DEFAULT 0,
  `errorMessage` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table: projects
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` INT,
  `name` TEXT NOT NULL,
  `status` TEXT,
  `progress` INT DEFAULT 0,
  `deadline` DATETIME,
  `manager` TEXT,
  `priority` TEXT,
  `color` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


SET FOREIGN_KEY_CHECKS = 1;

-- Export complete.