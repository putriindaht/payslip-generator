const request = require('supertest');
const { app } = require('../src/app');

describe('Submit Reimbursement Endpoint', () => {
    let employeeToken = null
    let adminToken = null
    
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

    it('should not allow submit reimbursement if not logged in (no token)', async () => {
        const res = await request(app)
        .post('/reimbursements')
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow submit reimbursement for invalid user (bad login)', async () => {
        const loginRes = await request(app)
        .post('/login/employee')
        .send({ username: 'wronguser', password: 'wrongpassword' });

        expect(loginRes.statusCode).toBe(400);
        expect(loginRes.body).toHaveProperty('error');
    });

    it('should not allow admin to submit reimbursement', async () => {
        const res = await request(app)
        .post('/reimbursements')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow submit reimbursement with invalid/expired token', async () => {
        const res = await request(app)
        .post('/reimbursements')
        .set('Authorization', 'Bearer thisisnotavalidtoken')
        .send();

        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow submit reimbursement with no body sent', async () => {
        const res = await request(app)
        .post('/reimbursements')
         .set('Authorization', `Bearer ${employeeToken}`)
        .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('should not allow submit reimbursement if body amount is not integer', async () => {
        const res = await request(app)
        .post('/reimbursements')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({amount: "50000", description: "lunch"});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error');
    });


    it('should allow employee to submit reimbursement', async () => {
        const res = await request(app)
        .post(`/reimbursements`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({amount: 50000, description: "internet"});

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('data');
    });

});
