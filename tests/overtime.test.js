const request = require('supertest');
const { app } = require('../src/app');
const { Overtime, Attendance } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

// Assume you have helper to mock Jakarta date
jest.mock('../src/helpers/jakartaTime', () => jest.fn());

const getJakartaNow = require('../src/helpers/jakartaTime');

describe('Overtime Submission', () => {
    let employeeToken;
    let employeeId

    beforeAll(async () => {
    const res = await request(app)
        .post('/login/employee')
        .send({ username: 'employee_01', password: 'password123' });

        employeeToken = res.body.access_token;
        employeeId = res.body.id
    });

    afterEach(async () => {
        await Overtime.destroy({ where: {employee_id: employeeId} }); // Clean up overtime
        await Attendance.destroy({ where: {employee_id: employeeId} }); // Clean up attendance
        jest.resetAllMocks();
    });

    it('should allow up to 3 hours overtime per day', async () => {
        // Set today to a weekday, 6pm Jakarta time
        getJakartaNow.mockReturnValue(new Date('2025-06-11T18:00:00+07:00'));

        // Submit 2 hours first
        let res = await request(app)
        .post('/overtimes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ hours_number: 2 });

        expect(res.statusCode).toBe(200);

        // Submit 1 more hour (total = 3)
        res = await request(app)
        .post('/overtimes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ hours_number: 1 });

        expect(res.statusCode).toBe(200);

        // Try to submit 1 more hour (should be rejected)
        res = await request(app)
        .post('/overtimes')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ hours_number: 1 });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    // it('should allow overtime after 5pm on weekdays', async () => {
    //     // Set today to a Wednesday, 6pm
    //     getJakartaNow.mockReturnValue(new Date('2025-06-12T18:00:00+07:00'));

    //     const res = await request(app)
    //     .post('/overtimes')
    //     .set('Authorization', `Bearer ${employeeToken}`)
    //     .send({ hours_number: 1 });

    //     expect(res.statusCode).toBe(200);
    // });

    // it('should allow overtime after checking out on weekdays before 5pm', async () => {
    //     // Set today to a Wednesday, 3pm
    //     getJakartaNow.mockReturnValue(new Date('2025-06-11T15:00:00+07:00'));

    //     // Create an attendance record with check_out_time
    //     await Attendance.create({
    //         id: uuidv4(),
    //         employee_id: employeeId, // use your employee id
    //         check_in_time: new Date('2025-06-11T08:00:00+07:00'),
    //         check_out_time: new Date('2025-06-11T14:30:00+07:00'),
    //         created_by: employeeId,
    //         updated_by: employeeId,
    //         request_id: uuidv4(),
    //         request_ip: '127.0.0.1',
    //         created_at: new Date(),
    //         updated_at: new Date(),
    //         is_deleted: false
    //     });

    //     const res = await request(app)
    //     .post('/overtimes')
    //     .set('Authorization', `Bearer ${employeeToken}`)
    //     .send({ hours_number: 2 });

    //     expect(res.statusCode).toBe(200);
    // });

    //   it('should reject overtime before 5pm on weekdays if not checked out', async () => {
    //     // Set today to a Wednesday, 3pm
    //     getJakartaNow.mockReturnValue(new Date('2025-06-11T15:00:00+07:00'));

    //     // No attendance or check_out_time for today

    //     const res = await request(app)
    //       .post('/overtimes')
    //       .set('Authorization', `Bearer ${employeeToken}`)
    //       .send({ hours_number: 1 });

    //     expect(res.statusCode).toBe(400);
    //     expect(res.body.message).toMatch(/after checking out or after 5pm/i);
    //   });

    //   it('should allow overtime anytime on weekends (Saturday/Sunday)', async () => {
    //     // Set today to a Saturday, 2pm
    //     getJakartaNow.mockReturnValue(new Date('2025-06-14T14:00:00+07:00'));

    //     const res = await request(app)
    //       .post('/overtimes')
    //       .set('Authorization', `Bearer ${employeeToken}`)
    //       .send({ hours_number: 3 });

    //     expect(res.statusCode).toBe(200);
    //   });

    //   it('should still enforce 3 hour max on weekends', async () => {
    //     // Set today to Sunday
    //     getJakartaNow.mockReturnValue(new Date('2025-06-15T12:00:00+07:00'));

    //     // Submit 2 hours
    //     let res = await request(app)
    //       .post('/overtimes')
    //       .set('Authorization', `Bearer ${employeeToken}`)
    //       .send({ hours_number: 2 });

    //     expect(res.statusCode).toBe(200);

    //     // Submit another 2 hours (should be rejected)
    //     res = await request(app)
    //       .post('/overtimes')
    //       .set('Authorization', `Bearer ${employeeToken}`)
    //       .send({ hours_number: 2 });

    //     expect(res.statusCode).toBe(400);
    //     expect(res.body.message).toMatch(/maximum is 3 hours per day/i);
    //   });
});
