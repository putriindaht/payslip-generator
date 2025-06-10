### Project Description

This project is designed for managing employee and admin interactions within an organization. Employees can manage their attendance by checking in and checking out, submit requests for overtime, and submit reimbursement requests. Admin users have the capability to run payrolls for specified periods and generate payslips, which employees can then access and review.

### ERD
- https://www.mermaidchart.com/app/projects/18e40684-2b9c-49e3-804e-eee8c7871fc4/diagrams/57b3fc83-65ef-4ee9-82b6-a81ffbcf33a1/version/v0.1/edit

### Postman Collection
- https://www.postman.com/warped-firefly-52632/workspace/payslip-generator-public/collection/28427156-278a6beb-4d8f-4c2f-8259-19efd833bbe2?action=share&creator=28427156

### Steps to Set Up the Project

1. Copy the repository from Git.
2. Clone the repository to your laptop.
3. Open the cloned folder and run:

   ```sh
   npm install
   ```
4. Ensure Docker Desktop is running, as PostgreSQL in this project uses Docker. To start, execute:

   ```sh
   docker compose up
   ```
5. Run migrations and seeders for both development and test environments using:

   ```sh
   npm run migrate
   npm run seed
   npm run migrate:test
   npm run seed:test
   ```

6. To run tests, use:

    ```sh
    npm run test
    ```

7. To start the project, use:

    ```sh
    npm run dev
    ```