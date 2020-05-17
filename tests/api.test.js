const request = require('supertest');
const server = require('../server.js');

/*
    Please be aware that those tests are just written as a showdown purpose, definitely
    there should be a test database in order to test against It,
    in this case I have chose to test against production database with production values.
 */

it('Should fetch Games with Athletes With Default Pagination (Size: 10, Number: 1)', async (done) => {
    const res = await request(server).get('/api/athletes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(res.body.data).toHaveLength(10);
    expect(res.body.last_page_number).toEqual(2);
    done();
});

it('Should fetch Games with Athletes With Custom Pagination (Size: 5, Number: 1)', async (done) => {
    const res = await request(server).get('/api/athletes?page_number=1&page_size=5');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(res.body.data).toHaveLength(5);
    expect(res.body.last_page_number).toEqual(3);
    done();
});

it('Should fetch Games with Athletes With Custom Pagination Last Number (Size: 5, Number: 3)', async (done) => {
    const res = await request(server).get('/api/athletes?page_number=3&page_size=5');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].city).toEqual('Barcelona');
    expect(res.body.last_page_number).toEqual(3);
    done();
});

it('Properly Sorted by Years', async (done) => {
    const res = await request(server).get('/api/athletes');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    for(let i = 0; i < res.body.data.length - 1; i++) {
        expect(res.body.data[i].year).toBeGreaterThan(res.body.data[i + 1].year);
    }
    done();
});

it('Should fetch Athlete with ID 1 (Arianna)', async (done) => {
    const res = await request(server).get('/api/athletes/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(res.body.data.name).toEqual('Arianna');
    done();
});

it('Should fetch Athlete with base64 IMG', async (done) => {
    const base64Regex = /([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/;
    const res = await request(server).get('/api/athletes/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(base64Regex.test(res.body.data.photo)).toBeTruthy();
    done();
});

it('Should fetch Athlete with Games', async (done) => {
    const res = await request(server).get('/api/athletes/1');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('data');
    expect(res.body.message).toEqual('success');
    expect(res.body.data.games).toHaveLength(4);
    done();
});

it('Should retrieve 404 and message error', async (done) => {
    const res = await request(server).get('/asdasdasdasdasdasd');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Resource not found');
    done();
});

it('Should retrieve 404 and message error', async (done) => {
    const res = await request(server).get('/api/asdasdasdasd');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toEqual('Resource not found');
    done();
});

afterAll( async () => {
    server.connection.close();
});