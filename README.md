# Exam Cell Website

This project is a comprehensive Exam Cell website designed with a robust role-based authentication system. It facilitates communication and management between different users within an academic institution, namely students, teachers, and administrators. The application is built using modern web development practices and technologies to ensure a scalable and maintainable system.

## Features
The website offers distinct functionalities based on the user's role:

- **Student**: Can log in to view their marks.  
- **Teacher**: Can respond to student queries and upload marks for their assigned subjects.  
- **Admin**: Has a supervisory role, with the ability to manage all aspects of the system. This includes responding to queries from both students and teachers and performing C.R.U.D. (Create, Read, Update, Delete) operations on student marks.  

## Technology Stack

### Backend
- **Spring Boot**: The core framework for building the backend.  
- **Architecture**: Designed following best practices including the use of Repository, Model, Controller, Service, DTO (Data Transfer Object), Entity, Auth, and Config layers for a clean and modular structure.  
- **Deployment**: The backend service is currently hosted on Heroku.  

### Frontend
- **Next.js**: A React framework used for building the user interface.  
- **TypeScript**: A typed superset of JavaScript, used to enhance code quality and maintainability.  

## Architecture and Best Practices
The project follows a strong architectural pattern to ensure separation of concerns and maintainability. The use of a layered architecture with dedicated components for Models, Views (handled by the frontend), and Controllers (Spring Boot) ensures a scalable and organized codebase.  

Key design patterns such as the Repository pattern are utilized for data access, promoting a decoupled and testable system.
