jest.mock('../src/helpers/attendanceHelper', () => {
  return jest.fn();
});

const request = require('supertest');
const { app } = require('../src/app');
const isWeekendInJakarta = require('../src/helpers/attendanceHelper');

describe('Attendance Check-In Endpoint', () => {
    let employeeToken = null
    let adminToken = null
    let attendanceId = null
    
    beforeAll(async () => {
       // Employee login
        const empRes = await request(app)
        .post('/login/employee')
        .send({ username: 'employee_01', password: 'password123' });

        employeeToken = empRes.body.access_token;

        // Admin login
        const adminRes = await request(app)
        .post('/login/admin')
        .send({ username: 'pretty-admin-01', password: 'password123' });

        adminToken = adminRes.body.access_token;
    });

    afterEach(() => {
        isWeekendInJakarta.mockReset();
    });

    it('should not allow check-in if not logged in (no token)', async () => {
        const res = await request(app)
        .post('/check-in')
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow check-in for invalid user (bad login)', async () => {
        const loginRes = await request(app)
        .post('/login/employee')
        .send({ username: 'wronguser', password: 'wrongpassword' });

        expect(loginRes.statusCode).toBe(400);
        expect(loginRes.body).toHaveProperty('error');
    });

    it('should not allow admin to check in', async () => {
        const res = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow check-in with invalid/expired token', async () => {
        const res = await request(app)
        .post('/check-in')
        .set('Authorization', 'Bearer thisisnotavalidtoken')
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

     it('should not allow check-in on a weekend', async () => {
        isWeekendInJakarta.mockReturnValue(true)
        const res = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send();

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should allow check-in on a weekday', async () => {
        isWeekendInJakarta.mockReturnValue(false)
        const res = await request(app)
        .post('/check-in')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('check_in_time');

        attendanceId = res.body.attendance_id;
        expect(attendanceId).toBeDefined();
    });

    it('should allow employee to check out after checking in', async () => {
        const res = await request(app)
        .patch(`/check-out/${attendanceId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send();

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('check_out_time');
    });

     it('should not allow employee to check out without checking in first', async () => {
        const fakeAttendanceId = '11111111-1111-1111-1111-111111111111';
        const res = await request(app)
        .patch(`/check-out/${fakeAttendanceId}`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send();

        expect([404, 400]).toContain(res.statusCode);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow check-out if not logged in (no token)', async () => {
        const res = await request(app)
        .patch(`/check-out/${attendanceId}`)
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow check-out for invalid user (bad login)', async () => {
        const loginRes = await request(app)
        .post('/login/employee')
        .send({ username: 'wronguser', password: 'wrongpassword' });

        expect(loginRes.statusCode).toBe(400);
        expect(loginRes.body).toHaveProperty('error');
    });

    it('should not allow admin to check out', async () => {
        const res = await request(app)
        .patch(`/check-out/${attendanceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow check-out with invalid/expired token', async () => {
        const res = await request(app)
        .patch(`/check-out/${attendanceId}`)
        .set('Authorization', 'Bearer thisisnotavalidtoken')
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

});
