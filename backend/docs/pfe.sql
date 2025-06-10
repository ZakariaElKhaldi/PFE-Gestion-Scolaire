-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 10 juin 2025 à 19:08
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `pfe`
--

--
-- Déchargement des données de la table `assignments`
--

INSERT INTO `assignments` (`id`, `title`, `description`, `courseId`, `dueDate`, `totalPoints`, `isPublished`, `attachmentUrl`, `createdAt`, `updatedAt`) VALUES
('63f5955a-b3e2-4752-926b-e36a0a22bf81', 'test2', 'test2 description', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '2025-04-20 00:00:00', 50, 0, NULL, '2025-04-05 19:00:15', '2025-04-05 19:00:15'),
('71499929-1e6d-4c25-814a-dde51dfc62b4', 'Periodic Table Quiz', 'Complete the quiz on the periodic table of elements', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', '2025-04-09 23:00:00', 40, 1, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('75ac7564-e4d3-4b31-bd80-c24cd7b47a78', 'Mechanics Lab Report', 'Write a lab report on the mechanics experiment conducted in class', '796ca36a-44a9-4419-a83a-14a5ece8fda0', '2025-04-14 23:00:00', 75, 1, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('77b6aedc-c8cb-413b-92be-42a42cdc66bb', 'Calculus Problem Set', 'Solve the calculus problems from textbook pages 45-50', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '2025-04-18 23:00:00', 100, 1, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('8eb44a34-484d-4e4a-a214-d8b3374e46fb', 'test3', 'test3 description', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '2025-04-18 00:00:00', 100, 0, NULL, '2025-04-05 19:07:27', '2025-04-05 19:07:27'),
('91fcfa16-fd7c-4a4c-86cd-1ab87d01f309', 'Algebra Quiz', 'Complete the algebra quiz covering chapters 1-3', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '2025-04-11 23:00:00', 50, 1, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d9433b5c-41d5-437f-87d3-5f52b0538a33', 'test', 'test description', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '2025-04-28 00:00:00', 20, 0, NULL, '2025-04-05 18:46:01', '2025-04-05 18:46:01');

--
-- Déchargement des données de la table `attendance`
--

INSERT INTO `attendance` (`id`, `courseId`, `studentId`, `date`, `status`, `notes`, `createdAt`, `updatedAt`) VALUES
('1f22f68b-37ec-4ebb-b296-ae1691d2ab19', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-03-19', 'excused', 'Family emergency', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('214bf662-f886-4008-85c8-4c8ad86965f1', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', '2025-03-24', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('39599b8e-0819-4dae-809d-93c55a4f83ca', '796ca36a-44a9-4419-a83a-14a5ece8fda0', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-03-25', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('39fd84c8-6627-464c-b331-e8844e05c846', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-03-18', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('63795ecb-708a-4cd7-9d00-7e51fbf30816', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-04-02', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('7a89e741-2f45-475a-92e6-6fbcf42c32aa', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-04-01', 'late', 'Student arrived 10 minutes late', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('89c72784-6f09-45a6-b6db-f4c8855c7910', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-03-26', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('a48939e8-7cd4-4d4c-bd5b-9e8f12a6e151', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', '2025-03-31', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('ce5cec7f-6bb9-4a03-9af4-7289621c086a', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-03-25', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d2317efd-21de-4a46-9ea8-6d9fa65b7b4e', '796ca36a-44a9-4419-a83a-14a5ece8fda0', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-03-18', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d7c88011-446c-406d-bc3d-3980fcb92c3c', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-03-24', 'absent', 'Student was sick', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('eaac6abf-ea44-413e-9e8e-af5b04766ed9', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-03-31', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('f301bc52-7fc5-4230-a815-d58159162d39', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-03-17', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('fc6fc3b3-daa1-40f3-bf08-b4a1eb6033d6', '796ca36a-44a9-4419-a83a-14a5ece8fda0', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '2025-04-01', 'present', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `classes`
--

INSERT INTO `classes` (`id`, `courseId`, `teacherId`, `room`, `capacity`, `status`, `createdAt`, `updatedAt`) VALUES
('032bf50c-a790-4106-b448-53741f2fa943', 'a9b04c4a-ae02-422c-9af4-95412b664b71', '349d3fb0-af01-440f-9e0d-14cc219aeb14', 'Room 203', 25, 'active', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('30e1cbd9-5d88-442f-b7d9-843f3995c023', '81f7c0b1-cb8c-49f8-a05d-3fa86e80bdff', 'dcae4b10-6179-4203-a851-00262fdfe6eb', 'Room 101', 30, 'active', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('495dd9f8-b0a3-40ea-8d87-cd81577ee690', 'ea417825-766f-4595-afaf-58cc55c3efe4', '7848aa9a-8ceb-445c-9172-a462892cb7ea', 'Room 101', 30, 'active', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('6c6a5497-3c06-44ac-b725-97bdabc4e0aa', '28fab197-8abe-4510-af3c-3995404ab8a8', 'f39b58c2-c174-4380-a7fa-fd2bc40f0697', 'Room 203', 25, 'active', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('7930cf10-d9dc-4a86-a236-4bdb6a6993e1', 'a4dfc66d-f8b1-46ca-9280-57a2f19603fe', 'f39b58c2-c174-4380-a7fa-fd2bc40f0697', 'Lab 2', 20, 'active', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('7d96957d-3b8a-420f-bb9a-9ead7ff66669', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'Room 101', 30, 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('9f785ac0-853a-4678-9125-b1d8240fb763', '5063e1ce-d226-4f9a-99c8-fd1f1b647130', '349d3fb0-af01-440f-9e0d-14cc219aeb14', 'Lab 2', 20, 'active', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('c8dc3f79-1102-4434-9b34-1059c182abe4', '796ca36a-44a9-4419-a83a-14a5ece8fda0', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', 'Room 203', 25, 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('cb52dcc6-eff3-473b-b4cf-7d893efdc6ac', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', 'Lab 2', 20, 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `class_schedules`
--

INSERT INTO `class_schedules` (`id`, `classId`, `day`, `startTime`, `endTime`, `createdAt`, `updatedAt`) VALUES
('11279771-a3c7-495d-a9f3-acc6261fbec9', '032bf50c-a790-4106-b448-53741f2fa943', 'tuesday', '13:00:00', '14:30:00', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('511cab4e-091a-4183-86e5-5208de01e65a', '9f785ac0-853a-4678-9125-b1d8240fb763', 'wednesday', '10:00:00', '12:00:00', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('5936ec75-e730-48fa-8942-70569c8ca355', '7d96957d-3b8a-420f-bb9a-9ead7ff66669', 'monday', '09:00:00', '10:30:00', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('63b4d3a8-513f-4f04-b804-15d94c256ec6', 'c8dc3f79-1102-4434-9b34-1059c182abe4', 'tuesday', '13:00:00', '14:30:00', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('78bfd223-46a9-451e-9765-322a084eabab', '495dd9f8-b0a3-40ea-8d87-cd81577ee690', 'monday', '09:00:00', '10:30:00', '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('8ceed2a5-797e-4884-ba11-a5315e128f2e', '7930cf10-d9dc-4a86-a236-4bdb6a6993e1', 'wednesday', '10:00:00', '12:00:00', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('b07c7cdb-aa78-41df-996e-6ccc9ae671ef', '6c6a5497-3c06-44ac-b725-97bdabc4e0aa', 'tuesday', '13:00:00', '14:30:00', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('df5d84b5-cb8a-42ff-bd1b-3882d93d7abd', '30e1cbd9-5d88-442f-b7d9-843f3995c023', 'monday', '09:00:00', '10:30:00', '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('f54ae33e-e944-49e8-90b9-0d819cd14734', 'cb52dcc6-eff3-473b-b4cf-7d893efdc6ac', 'wednesday', '10:00:00', '12:00:00', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `courses`
--

INSERT INTO `courses` (`id`, `title`, `description`, `code`, `credits`, `departmentId`, `teacherId`, `startDate`, `endDate`, `status`, `createdAt`, `updatedAt`) VALUES
('796ca36a-44a9-4419-a83a-14a5ece8fda0', 'Physics 101', 'Introduction to physics covering mechanics, thermodynamics, and waves', 'PHYS101', 3, NULL, '301657a1-aca7-4ef5-b2ec-56b4600e96e6', '2025-03-01 00:00:00', '2025-08-31 23:00:00', 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'Advanced Mathematics', 'Introduction to advanced mathematical concepts including calculus and linear algebra', 'MATH101', 4, NULL, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', '2025-03-01 00:00:00', '2025-08-31 23:00:00', 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d7322e46-fa9d-496c-aa70-ff3695a51d98', 'Chemistry Basics', 'Introduction to basic chemistry principles and laboratory techniques', 'CHEM101', 3, NULL, '301657a1-aca7-4ef5-b2ec-56b4600e96e6', '2025-03-01 00:00:00', '2025-08-31 23:00:00', 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `course_enrollments`
--

INSERT INTO `course_enrollments` (`id`, `studentId`, `courseId`, `status`, `enrollmentDate`, `completionDate`, `grade`, `createdAt`, `updatedAt`) VALUES
('1c8dce0d-56da-44a6-8186-822d29f01705', 'f4b969e2-324a-4333-9624-d016a54ea06d', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'active', '2025-04-05 10:17:54', NULL, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('20a0ee47-c7f2-4b6e-9f39-808abd0e1ca9', 'eb646bc7-bd52-44fe-9326-e17c3afec20f', 'a9b04c4a-ae02-422c-9af4-95412b664b71', 'active', '2025-04-05 10:16:46', NULL, NULL, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('2762e09b-901a-4cf1-b4b4-807351b8e3c8', 'f4b969e2-324a-4333-9624-d016a54ea06d', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'active', '2025-04-05 10:17:54', NULL, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('292dff6c-8dd5-42be-8cb5-52a81bc47ab0', 'f4c14917-5182-4e91-95e1-ee4031bfc14f', 'ea417825-766f-4595-afaf-58cc55c3efe4', 'active', '2025-04-05 10:16:46', NULL, NULL, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('68c3cd47-81b5-40dd-95f7-802cfc41efe1', '78e6edeb-e225-449d-9ebc-f5b8109d3493', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'active', '2025-04-05 10:17:54', NULL, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('7bdbf886-6735-4d06-8fa0-39ad779d9383', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'a9b04c4a-ae02-422c-9af4-95412b664b71', 'active', '2025-04-05 10:16:46', NULL, NULL, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('7f27c1cd-8f6b-4484-a040-be379961ff4a', 'd8dc48a3-d2a1-4793-9101-6f6a4438ded4', '28fab197-8abe-4510-af3c-3995404ab8a8', 'active', '2025-04-05 10:15:36', NULL, NULL, '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('960264ea-92a1-4e52-b038-f78075f23faa', 'f4b969e2-324a-4333-9624-d016a54ea06d', '81f7c0b1-cb8c-49f8-a05d-3fa86e80bdff', 'active', '2025-04-05 10:15:36', NULL, NULL, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('bd7ef8e1-bced-4ef6-ab85-da039064457f', 'd8dc48a3-d2a1-4793-9101-6f6a4438ded4', 'a4dfc66d-f8b1-46ca-9280-57a2f19603fe', 'active', '2025-04-05 10:15:36', NULL, NULL, '2025-04-05 10:15:37', '2025-04-05 10:15:37'),
('c2ee4e83-0cff-4e70-807d-865f4e7bbde6', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'ea417825-766f-4595-afaf-58cc55c3efe4', 'active', '2025-04-05 10:16:46', NULL, NULL, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('c7c2037f-6ebe-4f87-8564-abec37b04b10', 'eb646bc7-bd52-44fe-9326-e17c3afec20f', '5063e1ce-d226-4f9a-99c8-fd1f1b647130', 'active', '2025-04-05 10:16:46', NULL, NULL, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('d2e9d465-6434-450a-af09-96f634e62959', '92819f98-ba91-42be-b2df-9b0c00be9cad', '81f7c0b1-cb8c-49f8-a05d-3fa86e80bdff', 'active', '2025-04-05 10:15:36', NULL, NULL, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('d9c4fef6-4724-42bf-a803-46f34f78a73d', 'f4b969e2-324a-4333-9624-d016a54ea06d', '28fab197-8abe-4510-af3c-3995404ab8a8', 'active', '2025-04-05 10:15:36', NULL, NULL, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('e0a8fd4c-0009-479b-b54b-ef998a80f3c4', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'active', '2025-04-05 10:17:54', NULL, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('f41acf31-d9da-4f62-86e3-f8f83a23bc1e', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', 'active', '2025-04-05 10:17:54', NULL, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `departments`
--

INSERT INTO `departments` (`id`, `name`, `code`, `headId`, `description`, `established`, `status`, `createdAt`, `updatedAt`) VALUES
('0d31c675-f987-46e4-958a-fb12871a2af4', 'Science Department', 'SCI', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', 'Department responsible for science subjects including physics, chemistry, and biology', '0000-00-00', 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('24f2d373-f886-486c-ad2b-4616177900a1', 'Mathematics Department', 'MATH', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'Department responsible for mathematics subjects including algebra, geometry, and calculus', '0000-00-00', 'active', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `grades`
--

INSERT INTO `grades` (`id`, `studentId`, `courseId`, `assignmentId`, `value`, `type`, `gradedBy`, `gradedAt`, `comments`, `createdAt`, `updatedAt`) VALUES
('1c8b9a23-71c3-4b16-9db1-0cba45ec5531', 'f4b969e2-324a-4333-9624-d016a54ea06d', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '91fcfa16-fd7c-4a4c-86cd-1ab87d01f309', 90.00, 'assignment', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', '2025-04-05 10:17:54', 'Good work overall. Review factoring polynomials.', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('f108a752-bcdc-49cc-9f4d-99264f7b4e08', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', '91fcfa16-fd7c-4a4c-86cd-1ab87d01f309', 84.00, 'assignment', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', '2025-04-05 10:17:54', 'Solid understanding. Work on simplification techniques.', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `login_attempts`
--

INSERT INTO `login_attempts` (`id`, `userId`, `email`, `ipAddress`, `attemptTime`, `successful`) VALUES
(1, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 10:39:01', 0),
(2, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 10:39:01', 1),
(3, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 10:55:02', 0),
(4, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 10:55:02', 1),
(5, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 10:55:47', 0),
(6, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 10:55:47', 1),
(7, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 11:00:25', 0),
(8, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 11:00:26', 1),
(9, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 11:06:24', 0),
(10, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 11:06:24', 1),
(11, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 11:08:47', 0),
(12, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 11:08:47', 1),
(13, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 11:09:08', 0),
(14, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 11:09:08', 1),
(15, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 18:00:34', 0),
(16, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 18:00:34', 1),
(17, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 18:07:33', 0),
(18, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 18:07:33', 1),
(19, '5a19bcdd-1d84-430c-b1e8-266c0a501db2', 'parent@school.com', '::1', '2025-04-05 18:10:15', 0),
(20, '5a19bcdd-1d84-430c-b1e8-266c0a501db2', 'parent@school.com', 'N/A', '2025-04-05 18:10:16', 1),
(21, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 18:12:36', 0),
(22, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 18:12:36', 1),
(23, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 18:36:31', 0),
(24, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 18:36:31', 1),
(25, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '::1', '2025-04-05 19:42:47', 0),
(26, 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', 'N/A', '2025-04-05 19:42:47', 1);

--
-- Déchargement des données de la table `materials`
--

INSERT INTO `materials` (`id`, `courseId`, `title`, `description`, `type`, `url`, `uploadedBy`, `uploadedAt`, `size`, `duration`, `createdAt`, `updatedAt`) VALUES
('150a3efa-3038-49c6-bb8e-021b0f8cdd81', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'Mathematics Textbook', 'Required textbook for the course covering all essential topics', 'document', '/files/math/textbook.pdf', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', '2025-04-05 10:17:54', 5120, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('1cab96b7-56fb-4d48-8c62-52fd977ac74a', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'Physics Lab Manual', 'Manual containing instructions for all lab experiments', 'document', '/files/physics/lab_manual.pdf', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', '2025-04-05 10:17:54', 3072, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('a9f8e788-13ea-45da-81a1-eea7e9c27757', '9cb37c36-c604-472d-949b-7ea5d02a9cb3', 'Advanced Math Syllabus', 'Course syllabus with grading information, schedule, and expectations', 'document', '/files/math/syllabus.pdf', 'ee2dd7df-966c-43ca-b50e-8192d1c1403b', '2025-04-05 10:17:54', 1024, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d39773de-8843-432d-bf72-66e35c913e47', '796ca36a-44a9-4419-a83a-14a5ece8fda0', 'Lecture Slides: Newton\'s Laws', 'Presentation slides covering Newton\'s three laws of motion', 'video', '/files/physics/newton_laws_video.mp4', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', '2025-04-05 10:17:54', 15360, 1200, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('d701e1bd-5fef-41c8-b45b-c6cd90c3bed4', 'd7322e46-fa9d-496c-aa70-ff3695a51d98', 'Chemistry Fundamentals', 'Digital textbook covering all basic chemistry concepts', 'document', '/files/chemistry/fundamentals.pdf', '301657a1-aca7-4ef5-b2ec-56b4600e96e6', '2025-04-05 10:17:54', 4096, NULL, '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `name`, `executed_at`, `success`, `error_message`) VALUES
(1, 'create_migrations_table', '2025-04-05 10:34:40', 1, NULL),
(2, 'create_users_table', '2025-04-05 10:34:40', 1, NULL),
(3, 'create_departments_table', '2025-04-05 10:34:40', 1, NULL),
(4, 'add_auth_fields', '2025-04-05 10:34:40', 1, NULL),
(5, 'create_login_attempts_table', '2025-04-05 10:34:40', 1, NULL),
(6, 'create_courses_table', '2025-04-05 10:34:40', 1, NULL),
(7, 'create_classes_table', '2025-04-05 10:34:40', 1, NULL),
(8, 'create_course_enrollments_table', '2025-04-05 10:34:40', 1, NULL),
(9, 'create_class_schedules_table', '2025-04-05 10:34:40', 1, NULL),
(10, 'create_assignments_table', '2025-04-05 10:34:40', 1, NULL),
(11, 'create_submissions_table', '2025-04-05 10:34:40', 1, NULL),
(12, 'create_materials_table', '2025-04-05 10:34:40', 1, NULL),
(13, 'create_attendance_table', '2025-04-05 10:34:40', 1, NULL),
(14, 'create_documents_table', '2025-04-05 10:34:41', 1, NULL),
(15, 'create_grades_table', '2025-04-05 10:34:41', 1, NULL),
(16, 'create_parent_relationship_table', '2025-04-05 10:34:41', 1, NULL),
(17, 'create_feedback_table', '2025-04-05 10:34:41', 1, NULL),
(18, 'create_parent_child_table', '2025-04-05 10:34:41', 1, NULL),
(19, 'create_messages_table', '2025-04-05 10:34:41', 1, NULL);

--
-- Déchargement des données de la table `parent_child`
--

INSERT INTO `parent_child` (`id`, `parentId`, `studentId`, `relationship`, `isEmergencyContact`, `canPickup`, `createdAt`, `updatedAt`) VALUES
('0165598d-2184-4cbf-b7a8-80b5dc44f004', '3536a9ed-50c5-4cef-bf36-f6195cc7e46e', '92819f98-ba91-42be-b2df-9b0c00be9cad', 'parent', 1, 1, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('4fef64a6-2e81-4bdf-94a9-3e0cd9f629af', '5b1ae3c3-6798-4188-b76d-7b613d1bcf54', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'parent', 1, 1, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('59bc484d-4db0-4e14-a398-d4f85b2ebee9', '37772017-dc36-4ba7-ae11-c82197e3b3ec', 'eb646bc7-bd52-44fe-9326-e17c3afec20f', 'guardian', 1, 0, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('707f552d-2854-4bd0-b98f-b0c994f25a84', '5b1ae3c3-6798-4188-b76d-7b613d1bcf54', 'd8dc48a3-d2a1-4793-9101-6f6a4438ded4', 'guardian', 1, 0, '2025-04-05 10:15:36', '2025-04-05 10:15:36'),
('7fb04914-1ff0-4857-abf0-b9a362766145', '5a19bcdd-1d84-430c-b1e8-266c0a501db2', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'guardian', 1, 0, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('89701ea9-ad10-4d16-863d-9b6a34ec7921', '37772017-dc36-4ba7-ae11-c82197e3b3ec', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'parent', 1, 1, '2025-04-05 10:16:46', '2025-04-05 10:16:46'),
('8cebda75-bb89-44ea-8b75-ee8c9e8b55a0', '5a19bcdd-1d84-430c-b1e8-266c0a501db2', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'parent', 1, 1, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('aea7f9e5-7f8c-438b-a5ff-38952444da1a', '5c17b994-9b11-4011-87f4-d1f86d8e80a2', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', 'parent', 1, 1, '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('c7363986-abfe-441d-a711-72f4d1ed72fd', '11820180-9369-41f2-82a2-996194b1692d', 'f4c14917-5182-4e91-95e1-ee4031bfc14f', 'parent', 1, 1, '2025-04-05 10:16:46', '2025-04-05 10:16:46');

--
-- Déchargement des données de la table `skills`
--

INSERT INTO `skills` (`id`, `studentId`, `skillName`, `level`, `progress`, `createdAt`, `updatedAt`) VALUES
('skill-001-math-johnson', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'Mathematics', 'advanced', 90, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-002-prob-johnson', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'Problem Solving', 'intermediate', 75, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-003-crit-johnson', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'Critical Thinking', 'advanced', 85, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-004-anal-johnson', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'Analytical Skills', 'intermediate', 80, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-005-liter-emma', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'Literature', 'advanced', 88, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-006-write-emma', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'Creative Writing', 'intermediate', 82, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-007-research-emma', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'Research Skills', 'intermediate', 78, '2025-06-10 14:22:23', '2025-06-10 14:22:23'),
('skill-008-comm-emma', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 'Communication', 'advanced', 85, '2025-06-10 14:22:23', '2025-06-10 14:22:23');

--
-- Déchargement des données de la table `students`
--

INSERT INTO `students` (`id`, `userId`, `enrollmentDate`, `status`, `createdAt`, `updatedAt`) VALUES
('', 'f4b969e2-324a-4333-9624-d016a54ea06d', '2025-04-05', 'active', '2025-04-05 10:15:36', '2025-04-05 10:15:36');

--
-- Déchargement des données de la table `submissions`
--

INSERT INTO `submissions` (`id`, `assignmentId`, `studentId`, `submissionText`, `fileUrl`, `submissionDate`, `grade`, `feedback`, `isLate`, `status`, `createdAt`, `updatedAt`) VALUES
('bbb741d7-1444-4875-a454-f076c22e2819', '91fcfa16-fd7c-4a4c-86cd-1ab87d01f309', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'Here is my completed algebra quiz', 'https://example.com/submission1.pdf', '2025-03-29 10:17:54', 45, 'Good work! You missed a couple of questions on factoring.', 0, 'graded', '2025-04-05 10:17:54', '2025-04-05 10:17:54'),
('ca6dafcf-b5b2-4f53-a935-1e19623da80d', '75ac7564-e4d3-4b31-bd80-c24cd7b47a78', 'f4b969e2-324a-4333-9624-d016a54ea06d', 'My lab report for the mechanics experiment', 'https://example.com/submission2.pdf', '2025-03-22 10:17:54', NULL, NULL, 0, 'submitted', '2025-04-05 10:17:54', '2025-04-05 10:17:54');

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `role`, `createdAt`, `updatedAt`, `bio`, `studentId`, `emailVerified`, `accountLocked`, `accountSuspended`, `lastLoginAt`, `failedLoginAttempts`) VALUES
('301657a1-aca7-4ef5-b2ec-56b4600e96e6', 'science.teacher@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Sarah', 'Johnson', '123-456-7892', 'teacher', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'Science teacher specializing in physics and chemistry', NULL, 0, 0, 0, NULL, 0),
('5a19bcdd-1d84-430c-b1e8-266c0a501db2', 'parent@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Parent', 'Johnson', '123-456-7896', 'parent', '2025-04-05 10:17:54', '2025-04-05 18:10:16', 'Parent of a high school student', NULL, 0, 0, 0, '2025-04-05 18:10:16', 0),
('5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', 'mike.student@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Mike', 'Williams', '123-456-7894', 'student', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'High school student in arts track', '5a9eaf76-e167-4d72-ba24-ed6571cdc3c5', 0, 0, 0, NULL, 0),
('5c17b994-9b11-4011-87f4-d1f86d8e80a2', 'jane.parent@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Jane', 'Williams', '123-456-7897', 'parent', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'Parent of a high school student in arts track', NULL, 0, 0, 0, NULL, 0),
('78e6edeb-e225-449d-9ebc-f5b8109d3493', 'emma.student@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Emma', 'Davis', '123-456-7895', 'student', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'High school student interested in computer science', '78e6edeb-e225-449d-9ebc-f5b8109d3493', 0, 0, 0, NULL, 0),
('acbf1d60-3397-4624-a300-29fd6a78c856', 'admin@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Admin', 'User', '123-456-7890', '', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'System administrator for the school management system', NULL, 0, 0, 0, NULL, 0),
('ee2dd7df-966c-43ca-b50e-8192d1c1403b', 'teacher@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Teacher', 'Smith', '123-456-7891', 'teacher', '2025-04-05 10:17:54', '2025-04-05 19:42:47', 'Mathematics teacher with 10 years of experience', NULL, 0, 0, 0, '2025-04-05 19:42:47', 0),
('f4b969e2-324a-4333-9624-d016a54ea06d', 'student@school.com', '$2b$10$gsKL47pvDm6uUM34IdSBJ.oHTuxnNECoFL6GrYzEKBOuwCX1ee5Rq', 'Student', 'Johnson', '123-456-7893', 'student', '2025-04-05 10:17:54', '2025-04-05 10:17:54', 'High school student in science track', 'f4b969e2-324a-4333-9624-d016a54ea06d', 0, 0, 0, NULL, 0);

--
-- Déchargement des données de la table `user_settings`
--

INSERT INTO `user_settings` (`userId`, `theme`, `language`, `emailNotifications`, `pushNotifications`, `smsNotifications`, `updatedAt`) VALUES
('5a19bcdd-1d84-430c-b1e8-266c0a501db2', 'light', 'english', 1, 0, 0, '2025-04-05 18:11:23');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
