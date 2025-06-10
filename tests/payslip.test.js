
const request = require('supertest');
const { app } = require('../src/app');// Your Express app
const { sequelize, Admin, Employee, Payroll, Payslip } = require('../src/models');
const { generateRequestId } = require('../src/helpers/generateRequestId');

let employeeToken;
let adminToken;
let employeeId;
let adminId;
let payroll;

beforeAll(async () => {
    // employee login
    const empRes = await request(app)
    .post('/login/employee')
    .send({ username: 'employee_01', password: 'password123' });

    employeeToken = empRes.body.access_token;
    employeeId = empRes.body.id;

    // Admin logins
    const adminRes = await request(app)
    .post('/login/admin')
    .send({ username: 'pretty-admin-01', password: 'password123' });

    adminToken = adminRes.body.access_token;
    adminId = adminRes.body.id;
   
    // Create a payroll and associated payslip for testing
    payroll = await Payroll.create({
        period_start: new Date('2025-06-01'),
        period_end: new Date('2025-06-30'),
        created_by: adminId,
        updated_by: adminId,
        request_ip: '127.0.0.1',
        request_id: generateRequestId(),
        run_at: new Date(),
        completed_at: new Date()
    });

    // Insert a payslip record
    await Payslip.create({
        employee_id: employeeId,
        payroll_id: payroll.id,
        base_salary: 5000000,
        attendance_days: 20,
        attendance_adjustment: 2,
        attendance_pay: 4000000,
        overtime_hours: 5,
        overtime_rate: 62500,
        overtime_pay: 312500,
        reimbursement_total: 100000,
        reimbursement_detail: [{ amount: 100000, description: 'Taxi' }],
        take_home_pay: 4412500,
        request_ip: '127.0.0.1',
        request_id: generateRequestId(),
        created_by: adminId,
        updated_by: adminId,
        created_at: new Date(),
        updated_at: new Date(),
    });
});

afterAll(async () => {
    await Payslip.destroy({ where: {created_by: adminId} });
    await Payroll.destroy({ where: {created_by: adminId} });
});

describe('GET /payslip-details', () => {
  it('returns 404 if employee not found in system', async () => {
    const res = await request(app)
      .get('/payslip-details')
      .set('Authorization', `Bearer invalidtoken`)
      .query({ payroll_id: payroll.id });

    expect(res.status).toBe(401);
  });

  it('returns 404 if no payslip for given payroll', async () => {
    const anotherPayroll = await Payroll.create({
      period_start: new Date('2025-07-01'),
      period_end: new Date('2025-07-31'),
      created_by: adminId,
      updated_by: adminId,
      request_ip: '127.0.0.1',
      request_id: generateRequestId(),
      run_at: new Date(),
      completed_at: new Date()
    });

    const res = await request(app)
      .get('/payslip-details')
      .set('Authorization', `Bearer ${employeeToken}`)
      .query({ payroll_id: anotherPayroll.id });

    expect(res.status).toBe(404);
  });

  it('returns payslip data for authenticated employee', async () => {
    const res = await request(app)
      .get('/payslip-details')
      .set('Authorization', `Bearer ${employeeToken}`)
      .query({ payroll_id: payroll.id });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      employee_id:employeeId,
      payroll_id: payroll.id,
      take_home_pay: expect.any(Number),
    });
  });
});

describe('GET /payslip-summaries/:id', () => {
  it('returns 401 if token invalid', async () => {
    const res = await request(app)
      .get(`/payroll-summaries/${payroll.id}`)
      .set('Authorization', `Bearer invalidtoken`);

    expect(res.status).toBe(401);
  });

  it('returns summary data for authorized admin', async () => {
    const payslip = await Payslip.findOne({where: {payroll_id: payroll.id}})
    console.log(payslip, "ini ada lah")
    const res = await request(app)
      .get(`/payroll-summaries/${payroll.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});
