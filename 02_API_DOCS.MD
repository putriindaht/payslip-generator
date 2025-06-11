# Payslip Generator API Documentation

## Authentication

All endpoints except login require authentication via a Bearer token.
Employee or admin authorization is enforced where required.

---

## Postman Collection
https://www.postman.com/warped-firefly-52632/workspace/payslip-generator-public/collection/28427156-278a6beb-4d8f-4c2f-8259-19efd833bbe2?action=share&creator=28427156&active-environment=28427156-c99b9ae1-724b-4aa9-b03b-10ca6aa85650

---

## Endpoints

---

### 1. User Authentication

#### Employee Login

* **POST** `/login/employee`
* **Body**

  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
* **Response**

  ```json
  {
    "status_code": 200,
    "id": 1,
    "username": "employee1",
    "message": "Employee employee1 login successfull",
    "access_token": "jwt_token"
  }
  ```

#### Admin Login

* **POST** `/login/admin`
* **Body**: *(same as employee login)*
* **Response**: *(same as employee login)*

---

### 2. Attendance

#### Employee Check-In

* **POST** `/check-in`
* **Headers**: `Authorization: Bearer <token>`
* **Response**

  ```json
  {
    "status_code": 200,
    "attendance_id": 123,
    "message": "employee1 Check-in Successfull",
    "check_in_time": "2024-06-12T09:00:00.000Z"
  }
  ```

  * **Note:** Can only check in on weekdays.

#### Employee Check-Out

* **PATCH** `/check-out/:attendance_id`
* **Path Parameter**

  * `attendance_id` (integer) — The ID of the attendance record to check out.
* **Headers**: `Authorization: Bearer <token>`
* **Response**

  ```json
  {
    "status_code": 200,
    "attendance_id": 123,
    "message": "employee1 Check-out Successfull",
    "check_out_time": "2024-06-12T17:00:00.000Z"
  }
  ```

---

### 3. Reimbursement

#### Submit Reimbursement

* **POST** `/reimbursements`
* **Headers**: `Authorization: Bearer <token>`
* **Body**

  ```json
  {
    "amount": 100000,
    "description": "Purchase of stationery"
  }
  ```
* **Response**

  ```json
  {
    "status_code": 200,
    "data": { /* Reimbursement Record */ }
  }
  ```
* **Validations:**

  * `amount` required, must be integer
  * `description` required

---

### 4. Overtime

#### Submit Overtime

* **POST** `/overtimes`
* **Headers**: `Authorization: Bearer <token>`
* **Body**

  ```json
  {
    "hours_number": 2
  }
  ```
* **Response**

  ```json
  {
    "status_code": 200,
    "data": { /* Overtime Record */ }
  }
  ```
* **Validations:**

  * Max 3 hours per submission/day
  * On weekdays: must check out or after 5pm

---

### 5. Payroll (Admin Only)

#### Submit Payroll Period

* **POST** `/payroll-periods`
* **Headers**: `Authorization: Bearer <admin_token>`
* **Body**

  ```json
  {
    "period_start": "01-06-2024",
    "period_end": "30-06-2024"
  }
  ```
* **Response**

  ```json
  {
    "status_code": 201,
    "data": { /* Payroll Record */ }
  }
  ```
* **Validations:**

  * No overlap with existing periods
  * Dates in `dd-mm-yyyy` format

#### Run Payroll Calculation

* **PATCH** `/payroll-runs/:payroll_id`
* **Path Parameter**

  * `payroll_id` (integer) — The ID of the payroll period to run payroll for.
* **Headers**: `Authorization: Bearer <admin_token>`
* **Response**

  ```json
  {
    "status_code": 200,
    "message": "Payroll completed",
    "payroll_id": 123
  }
  ```
* **Description:** Runs calculation for all employees for the period.

---

### 6. Payslip

#### Summary Payslip for Payroll Period (Admin)

* **GET** `/payroll-summaries/:payroll_id`
* **Path Parameter**

  * `payroll_id` (integer) — The ID of the payroll period to summarize.
* **Headers**: `Authorization: Bearer <admin_token>`
* **Response**

  ```json
  {
    "status_code": 200,
    "total_take_home_pay": 12000000,
    "data": [
      {
        "employee_id": 1,
        "employee_username": "employee1",
        "take_home_pay": 5000000
      }
      // ...more employees
    ]
  }
  ```

#### Get Employee Payslip (Employee)

* **GET** `/payslip-details?payroll_id=123`
* **Query Parameter**

  * `payroll_id` (integer) — The ID of the payroll period you want the payslip for.
* **Headers**: `Authorization: Bearer <token>`
* **Response**

  ```json
  {
    "status_code": 200,
    "data": {
      "employee_id": 1,
      "payroll_id": 123,
      "employee_username": "employee1",
      "take_home_pay": 5000000,
      "base_salary": 4500000,
      "attendance_adjustment": 0,
      "attendance_days": 20,
      "overtime_hours": 4,
      "overtime_rate": 100000,
      "overtime_pay": 400000,
      "reimbursement_total": 100000,
      "reimbursement_detail": [
        { "amount": 100000, "description": "Purchase of stationery" }
      ]
    }
  }
  ```

---

## Error Response Example

```json
{
  "status_code": 400,
  "message": "Error message here"
}
```

---

## General Notes

* All endpoints except login require authentication.
* Created/updated records store `request_ip` and `request_id`.
* Dates/times use **Asia/Jakarta** timezone unless stated otherwise.

---
