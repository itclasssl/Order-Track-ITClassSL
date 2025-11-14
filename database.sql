-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: order_tracking
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(200) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `item_status` varchar(50) DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `order_items`
--

LOCK TABLES `order_items` WRITE;
/*!40000 ALTER TABLE `order_items` DISABLE KEYS */;
INSERT INTO `order_items` VALUES (17,17,1,'Cake Box',1,'Pending',''),(21,24,8,'box6666',1,'In Production','');
/*!40000 ALTER TABLE `order_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `customer_id` (`customer_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `tbl_customer` (`Cust_id`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `orders`
--

LOCK TABLES `orders` WRITE;
/*!40000 ALTER TABLE `orders` DISABLE KEYS */;
INSERT INTO `orders` VALUES (17,'ORD-2025-0001',10,'2025-11-12',NULL,'Pending','','2025-11-12 03:18:55','2025-11-12 03:18:55'),(18,'ORD-2025-0002',5,'2025-11-12',NULL,'Pending','','2025-11-12 03:19:04','2025-11-13 03:17:53'),(24,'ORD-2025-0004',12,'2025-11-12','2025-11-24','Pending','','2025-11-13 03:43:57','2025-11-14 05:31:35');
/*!40000 ALTER TABLE `orders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `production_steps`
--

DROP TABLE IF EXISTS `production_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `production_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) NOT NULL,
  `step_name` varchar(100) NOT NULL,
  `step_order` int(11) NOT NULL DEFAULT 1,
  `status` varchar(50) DEFAULT 'Pending',
  `assigned_to` varchar(100) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`),
  CONSTRAINT `production_steps_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `production_steps`
--

LOCK TABLES `production_steps` WRITE;
/*!40000 ALTER TABLE `production_steps` DISABLE KEYS */;
INSERT INTO `production_steps` VALUES (2,17,'Plate',1,'Pending','John Smith',NULL,NULL,''),(3,17,'Cutter',1,'Pending','',NULL,NULL,''),(4,17,'Plate',1,'Pending','',NULL,NULL,''),(11,21,'Print',1,'Pending','John Smith',NULL,NULL,''),(12,21,'Plate',1,'Pending','',NULL,NULL,'');
/*!40000 ALTER TABLE `production_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `default_size` varchar(100) DEFAULT NULL,
  `default_color` varchar(100) DEFAULT NULL,
  `default_material` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES (1,'Cake Box','5','5','5','2025-11-09 13:57:30'),(2,'Cake Box2','1','2','3','2025-11-11 10:37:16'),(3,'box22','5','5','5','2025-11-11 11:39:56'),(4,'Cake Box25','5','5','5','2025-11-11 13:34:36'),(5,'Cake Box666','55','555','77','2025-11-11 14:11:05'),(6,'Cake Box555','89','899','999','2025-11-11 14:33:08'),(7,'box55','8','5','128 Gsm','2025-11-13 03:35:30'),(8,'box6666','','','','2025-11-13 03:44:25');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tbl_customer`
--

DROP TABLE IF EXISTS `tbl_customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tbl_customer` (
  `Cust_id` int(11) NOT NULL AUTO_INCREMENT,
  `Cust_Name` varchar(100) NOT NULL,
  `Cust_Company` varchar(100) DEFAULT NULL,
  `Cust_No` varchar(20) DEFAULT NULL,
  `Cust_Email` varchar(100) NOT NULL,
  `Cust_Address` text NOT NULL,
  `Cust_Status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`Cust_id`),
  UNIQUE KEY `Cust_Email` (`Cust_Email`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tbl_customer`
--

LOCK TABLES `tbl_customer` WRITE;
/*!40000 ALTER TABLE `tbl_customer` DISABLE KEYS */;
INSERT INTO `tbl_customer` VALUES (4,'A','Saman Man','555','Amithafz@gmail.com','11 Main','Active','2025-11-11 11:37:26'),(5,'AAAA','AAA','0777337279','Afayezthahir@gmail.com','11 Main 555','Active','2025-11-11 11:41:00'),(9,'4Fayaz Thahir','44','0777337279','4fayezthahir@gmail.com','11 Main','Active','2025-11-11 14:32:28'),(10,'BB','666','55','bb@bb.com','6682','Active','2025-11-12 03:18:53'),(12,'Fayaz Thahir666','3333','0777337279','fayezthahir@gmail.com555','11 Main','Active','2025-11-13 03:35:03'),(14,'Fayaz Thahir99','','0777337279','99fayezthahir@gmail.com','11 Main','Active','2025-11-14 06:38:50'),(15,'Fayaz Thahir55','555','0777337279','fayezthahir@gmail.comss','11 Main','Active','2025-11-14 06:44:26');
/*!40000 ALTER TABLE `tbl_customer` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-14 13:13:36
