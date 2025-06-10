jest.mock('../src/helpers/attendanceHelper', () => {
  return jest.fn();
});

const request = require('supertest');
const { app } = require('../src/app');
const { Attendance, Overtime } = require('../src/models');
const { generateRequestId } = require('../src/helpers/generateRequestId');
const isWeekendInJakarta = require('../src/helpers/attendanceHelper');

let employeeToken;
let employeeId;

beforeAll(async () => {
    // employee login
    const res = await request(app)
    .post('/login/employee')
    .send({ username: 'employee_01', password: 'password123' });

    employeeToken = res.body.access_token;
    employeeId = res.body.id;
});

afterAll(async () => {
    await Attendance.destroy({ where: {employee_id: employeeId} });
    await Overtime.destroy({ where: {employee_id: employeeId} });
});

describe('POST /overtimes', () => {
    const url = '/overtimes';

    it('should reject hours_number > 3', async () => {
        const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ hours_number: 4 });

        expect(res.status).toBe(400);
    });

    it('should reject when token invalid', async () => {
        const res = await request(app)
        .post(url)
        .set('Authorization', `Bearer invalidtoken`)
        .send({ hours_number: 2 });

        expect(res.status).toBe(401);
    });

    describe('weekday rules', () => {
        beforeEach(async () => {
            // // clear attendance and overtime
            await Attendance.destroy({ where: {employee_id: employeeId} });
            await Overtime.destroy({ where: {employee_id: employeeId} });
        });

        it('should reject if no checkout and before 5pm', async () => {
            // create attendance without check_out_time
            await Attendance.create({
                employee_id: employeeId,
                check_in_time: new Date('2025-06-02T08:00:00+07:00'),
                updated_by: employeeId,
                created_by: employeeId,
                request_id: generateRequestId(),
                request_ip: '127.0.0.1',
             });

            const res = await request(app)
                .post(url)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ hours_number: 1 });

            expect(res.status).toBe(400);
        });

        it('should allow after checkout', async () => {
            jest.useFakeTimers('modern');
            jest.setSystemTime(new Date('2025-06-02T17:30:00+07:00'));
            await Attendance.create({
                employee_id: employeeId,
                check_in_time: new Date('2025-06-02T08:00:00+07:00'),
                check_out_time: new Date('2025-06-02T15:00:00+07:00'),
                updated_by: employeeId,
                created_by: employeeId,
                request_id: generateRequestId(),
                request_ip: '127.0.0.1',
            });

            const res = await request(app)
                .post(url)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ hours_number: 2 });

            expect(res.status).toBe(200);

            jest.useRealTimers();
        });

        it('should allow after 5pm even without checkout', async () => {
            jest.useFakeTimers('modern');
            jest.setSystemTime(new Date('2025-06-02T17:30:00+07:00'));

            await Attendance.create({
                employee_id: employeeId,
                check_in_time: new Date('2025-06-02T09:00:00+07:00'),
                updated_by: employeeId,
                created_by: employeeId,
                request_id: generateRequestId(),
                request_ip: '127.0.0.1',

            });

            const res = await request(app)
                .post(url)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ hours_number: 1 });

            expect(res.status).toBe(200);

            jest.useRealTimers();
        });
    });

  describe('daily limit', () => {
        beforeEach(async () => {
            jest.useFakeTimers('modern');
            jest.setSystemTime(new Date('2025-06-03T18:00:00+07:00'));
            // Force weekday
            isWeekendInJakarta.mockReturnValue(false);

            // clear attendance and overtime
            await Attendance.destroy({ where: {employee_id: employeeId} });
            await Overtime.destroy({ where: {employee_id: employeeId} });

            // create new attendance and overtime
            await Attendance.create({
                employee_id: employeeId,
                check_in_time: new Date('2025-06-03T08:00:00+07:00'),
                check_out_time: new Date('2025-06-03T17:00:00+07:00'),
                created_by: employeeId,
                updated_by: employeeId,
                request_id: generateRequestId(),
                request_ip: '127.0.0.1',
            });

            await Overtime.create({
                employee_id: employeeId,
                hours_number: 2,
                created_at: new Date('2025-06-03T09:00:00+07:00'),
                created_by: employeeId,
                updated_by: employeeId,
                request_id: generateRequestId(),
                request_ip: '127.0.0.1',
            });
        });

        it('should reject if total overtime exceeds 3', async () => {
            const res = await request(app)
                .post(url)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ hours_number: 2 });

            expect(res.status).toBe(400);
        
            jest.useRealTimers();
        });

        it('should allow if within daily limit', async () => {
            const res = await request(app)
                .post(url)
                .set('Authorization', `Bearer ${employeeToken}`)
                .send({ hours_number: 1 });

            expect(res.status).toBe(200);

            jest.useRealTimers();
        });
    });
});
