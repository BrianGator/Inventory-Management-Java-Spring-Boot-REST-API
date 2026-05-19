# Retail Inventory Backend Final Project (Java Spring Boot Edition)

**Project summary:** Retail Inventory Backend Final Project with Java, Spring Boot, and Hibernate, backed by MySQL for structured data and a NoSQL database (MongoDB) for unstructured data such as product reviews.

_Written by Brian McCarthy_

> **Note on Environment:** This project includes a complete Java Spring Boot 3.x source codebase located in the `/backend` directory. Due to platform constraints, the interactive preview in AI Studio uses a Node.js compatibility layer (`server.js`) that simulates the Spring Boot API behavior using Firestore. FOR FINAL SUBMISSION: Use the code in `/backend`.

## Admin Responsibilities
The admin is responsible for performing the following tasks:
* **Creating and maintaining store records:** Provision and manage regional distribution hubs (Entity: `Store`).
* **Managing the entire product catalog:** Centralized master registry for all SKUs (Entity: `Product`).
* **Monitoring and updating inventory across all stores:** Real-time visibility and buffer adjustments (Entity: `Inventory`).
* **Placing customer orders via the internal system:** Transactional entry point (Entity: `Order`, `Customer`).
* **Running backend SQL procedures:** Executing complex analytical queries for business intelligence.

## Technical Scope (Java/Spring)
This project delivers:
* **Models, controllers, services, and repositories:** Full domain coverage for Store, Product, Inventory, Order, Customers, and Reviews.
* **RESTful endpoints:** Robust v1 API built in Spring Boot 3.2.
* **Persistence & Hibernate:** JPA-mapped entities with Hibernate validations for MySQL; Document mapping for MongoDB.
* **Analytical Procedures:** Implementation of native SQL queries and join-simulations for data analysis.
* **Structured Logging & Exception Handling:** Using SLF4J/Logback and a `@RestControllerAdvice` for global error mapping.

## Local Development (Backend)
### Prerequisites
Use the files in the `/backend` folder. To run it locally:
1. **IDE:** Open `/backend` in IntelliJ IDEA or Eclipse.
2. **Runtime:** Ensure you have **Java 17+** and **Maven** installed.
3. **Configuration:** Configure your `application.properties` with your MySQL and MongoDB credentials.
4. **Execution:** Run the following command in the terminal:
   ```bash
   mvn spring-boot:run
   ```

---
**Author:** Brian McCarthy
