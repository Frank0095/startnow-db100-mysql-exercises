const expect = require('chai').expect;
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('../../config.js');

const allActorColumns = ['actor_id', 'first_name', 'last_name', 'last_update'];
const allCategoryColumns = ['category_id', 'name', 'last_update'];
const allCustomerColumns = ['customer_id', 'store_id', 'first_name', 'last_name', 'email', 'address_id', 'active', 'create_date', 'last_update'];
const allPaymentColumns = ['payment_id', 'customer_id', 'staff_id', 'rental_id', 'amount', 'payment_date', 'last_update'];
const allStaffColumns = ['staff_id', 'first_name', 'last_name', 'address_id', 'picture', 'email', 'store_id', 'active', 'username', 'password', 'last_update'];

describe('DML Exercises', () => {
    let sqlConnection = null;

    const readAndExecute = (filename, callback) => {
        const sql = fs.readFileSync(path.join(__dirname, `${filename}.sql`), 'utf-8');
        sqlConnection.query(sql, (err, results) => {
            callback(results);
        });
    }

    const expectColumnStuff = (expectedColumns, results) => {
        expect(results.every(result => Object.keys(result).length === expectedColumns.length)).to.equal(true, `Expected ${expectedColumns.length} columns, saw ${Object.keys(results[0]).length} instead.`);
        expectedColumns.forEach((col, i) => {
            expect(results.every((result, j) => Object.keys(result)[i] === col)).to.equal(true, `Expected to see ${col} column in result set`);
        });
    }

    beforeEach(() => {
        sqlConnection = new mysql.createConnection({
            multipleStatements: true,
            host: 'localhost',
            user: config.username,
            password: config.password,
            database: 'sakila'
        });

        sqlConnection.connect();
    });

    afterEach(() => {
        sqlConnection.end();
    })

    it('01-select-statement.sql', (done) => {
        readAndExecute('01-select-statement', (results) => {
            expectColumnStuff(['actor_id', 'first_name', 'last_name', 'last_update']);

            expect(results[0].length).to.equal(200, 'Expected to see a result set containing all 200 actors.');

            done();
        });
    });

    it('02-distinct.sql', (done) => {
        readAndExecute('02-distinct', (results) => {
            expectColumnStuff(['last_name'], results);

            expect(results.length).to.equal(121, 'Expected to see a result set containing all 121 last names.');

            done();
        });
    });

    it('03-where.sql', (done) => {
        readAndExecute('03-where', (results) => {
            expectColumnStuff(['title', 'description', 'rating', 'length'], results[0]);
            expect(results[0].length).to.equal(46);
            expect(results[0].every(result => result.length >= 180)).to.equal(true);

            expectColumnStuff(['payment_id', 'amount', 'payment_date'], results[1]);
            expect(results[1].length).to.equal(16041);

            done();
        });
    });

    it('04-and.sql', (done) => {
        readAndExecute('04-and', (results) => {
            expectColumnStuff(['payment_id', 'amount', 'payment_date'], results[0]);
            expect(results[0].length).to.equal(167);
            expect(results[0].every(result => moment(result.payment_date).isAfter(moment('2005-05-27 00:00:00')))).to.equal(true);
            expect(results[0].every(result => moment(result.payment_date).isBefore(moment('2005-05-27 23:59:59')))).to.equal(true);

            expectColumnStuff(allCustomerColumns, results[1]);
            expect(results[1].length).to.equal(54);
            expect(results[1].every(r => r.active)).to.equal(true);
            expect(results[1].every(r => r.last_name[0] === 'S')).to.equal(true);

            done();
        });
    });

    it('05-or.sql', (done) => {
        readAndExecute('05-or', (results) => {
            expectColumnStuff(allCustomerColumns, results[0]);
            expect(results[0].length).to.equal(336);
            expect(results[0].every(r => r.store_id === 1 || r.last_name[0] === 'D')).to.equal(true);

            expectColumnStuff(allCategoryColumns, results[1]);
            expect(results[1].length).to.equal(4);
            expect(results[1].every(r => r.category_id > 4 && r.name[0] === 'C' || r.name[0] === 'S' || r.name[0] === 'T')).to.equal(true);

            done();
        });
    });

    it('06-in.sql', (done) => {
        readAndExecute('06-in', (results) => {
            expectColumnStuff(['phone', 'district'], results[0]);
            expect(results[0].length).to.equal(24);
            expect(results[0].every(r => ['California', 'England', 'Taipei', 'West Java'].includes(r.district))).to.equal(true);

            expectColumnStuff(['payment_id', 'amount', 'payment_date'], results[1]);
            expect(results[1].length).to.equal(458);
            expect(results[1].every(r => ['2005-05-25', '2005-05-27', '2005-05-29'].includes(moment(r.payment_date).format('YYYY-MM-DD')))).to.equal(true);

            done();
        });
    });

    it('07-between.sql', (done) => {
        readAndExecute('07-between', (results) => {
            expectColumnStuff(allPaymentColumns, results[0]);
            expect(results[0].every(r => moment(r.payment_date).isBetween(moment('2005-05-25 00:00:00'), moment('2005-05-26 23:59:59')))).to.equal(true);

            expectColumnStuff(['title', 'description', 'release_year', 'total_rental_cost'], results[1]);
            expect(results[1].every(r => r.description.split(' ').length >= 18 && r.description.split(' ').length <= 20)).to.equal(true);

            done();
        });
    });

    it('08-like.sql', (done) => {
        readAndExecute('08-like', (results) => {
            expectColumnStuff(['title', 'description', 'release_year'], results[0]);
            expect(results[0].every(r => r.description.substring(0, 12) === 'A Thoughtful')).to.equal(true);

            expectColumnStuff(['title', 'description', 'rental_duration'], results[1]);
            expect(results[1].every(r => r.description.substring(r.description.length - 4, r.description.length) === 'Boat')).to.equal(true);
            
            expectColumnStuff(['title', 'length', 'description', 'rental_rate'], results[2]);
            expect(results[2].every(r => r.length > 180)).to.equal(true);

            done();
        });
    });

    it('09-limit.sql', (done) => {
        readAndExecute('09-limit', (results) => {
            expectColumnStuff(allPaymentColumns, results[0]);
            expect(results[0].length).to.equal(20);
            expect(results[0][0].payment_id).to.equal(1);

            expectColumnStuff(['payment_date', 'amount'], results[1]);
            expect(results[1].length).to.equal(1000);
            expect(results[1].every(r => r.amount > 5)).to.equal(true);

            done();
        });
    });

    it('10-is-it-null.sql', (done) => {
        readAndExecute('10-is-it-null', (results) => {
            expectColumnStuff(allStaffColumns, results[0]);
            expect(results[0][0].password).to.equal(null);

            expectColumnStuff(['staff_id', 'first_name', 'last_name', 'address_id', 'picture', 'email', 'store_id', 'active', 'username', 'last_update'], results[1]);
            expect(results[1][0].staff_id).to.equal(1);

            done();
        });
    });
});