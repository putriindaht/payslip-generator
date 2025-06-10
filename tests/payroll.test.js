const request = require('supertest');
const { app } = require('../src/app');// Your Express app
const { sequelize, Admin, Payroll, Employee, Attendance, Overtime, Reimbursement, Payslip } = require('../src/models');
const { generateRequestId } = require('../src/helpers/generateRequestId');

// Helpers to parse dates
defineProperty = Date.prototype;

let adminToken;
let adminId;
let employee

beforeAll(async () => {
    const res = await request(app)
    .post('/login/admin')
    .send({ username: 'pretty-admin-01', password: 'password123' });

    console.log(res.body, "admin bgt")

    adminToken = res.body.access_token;
    adminId = res.body.id;
    console.log(adminToken, "admin token")

    employee = await Employee.findOne({where: {username: 'employee_01'}});
});

afterAll(async () => {
    await Payroll.destroy({ where: {created_by: adminId} });
    await Attendance.destroy({ where: {employee_id: employee.id} });
    await Overtime.destroy({ where: {employee_id: employee.id} });
});

describe('POST /payroll-periods', () => {
    it('should validate required fields', async () => {
        const res = await request(app)
        .post('/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should reject invalid date format', async () => {
        const res = await request(app)
        .post('/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ period_start: '2025/06/01', period_end: '01-06-2025' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should reject end date before start', async () => {
        const res = await request(app)
        .post('/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ period_start: '05-06-2025', period_end: '01-06-2025' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should create a payroll period', async () => {
        await Payroll.destroy({ where: {created_by: adminId} });
        
        const res = await request(app)
        .post('/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            period_start: '01-06-2025',
            period_end: '17-06-2025'
        });

        expect(res.status).toBe(201);
    });

    it('should prevent overlapping periods', async () => {
        // Existing: 01-06-2025 -> 04-06-2025
        const res = await request(app)
        .post('/payroll-periods')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            period_start: '03-06-2025',
            period_end: '05-06-2025'
        });

        expect(res.status).toBe(400);
    });
});

describe('POST /payroll-runs', () => {
    let payroll;

    beforeAll(async () => {
        // Create a new non-run payroll for testing
        payroll = await Payroll.create({
            period_start: new Date('2025-06-05'),
            period_end: new Date('2025-06-07'),
            created_by: adminId,
            updated_by: adminId,
            request_ip: '127.0.0.1',
            request_id: generateRequestId()
        });

        // Seed attendance, overtime, reimbursement
        await Attendance.bulkCreate([
            {
                employee_id: employee.id,
                check_in_time: new Date('2025-06-05T08:00:00Z'),
                created_by: employee.id,
                updated_by: employee.id,
                request_ip: '127.0.0.1',
                request_id: generateRequestId()
            },
            {
                employee_id: employee.id,
                check_in_time: new Date('2025-06-06T08:00:00Z'),
                created_by: employee.id,
                updated_by: employee.id,
                request_ip: '127.0.0.1',
                request_id: generateRequestId()
            }
        ]);

        await Overtime.create({
            employee_id: employee.id,
            hours_number: 2,
            created_at: new Date('2025-06-05'),
            created_by: employee.id,
            updated_by: employee.id,
            request_ip: '127.0.0.1',
            request_id: generateRequestId()
        });

        await Reimbursement.create({
            employee_id: employee.id,
            amount: 50000,
            description: 'Taxi',
            created_at: new Date('2025-06-06'),
            created_by: employee.id,
            updated_by: employee.id,
            request_ip: '127.0.0.1',
            request_id: generateRequestId()
        });
    });

    it('should error if already run', async () => {
        // mark as run
        await payroll.update({ run_at: new Date() });

        const res = await request(app)
        .patch(`/payroll-runs/${payroll.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(400);
    });

    it('should process payroll and create payslips', async () => {
        // Reset run flags
        await payroll.update({ run_at: null, completed_at: null });

        const res = await request(app)
        .patch(`/payroll-runs/${payroll.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);

        const payslips = await Payslip.findAll({ where: { payroll_id: payroll.id } });
        expect(payslips.length).toBeGreaterThan(0);

        const updated = await Payroll.findByPk(payroll.id);
        expect(updated.run_at).not.toBeNull();
        expect(updated.completed_at).not.toBeNull();
    });
});
