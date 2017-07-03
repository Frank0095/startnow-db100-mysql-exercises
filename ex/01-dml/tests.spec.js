const chai = require('chai');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const config = require('../../config.js');

chai.use(require('chai-sorted'));
chai.use(require('chai-as-promised'));
const expect = chai.expect;

const allActorColumns = ['actor_id', 'first_name', 'last_name', 'last_update'];
const allCategoryColumns = ['category_id', 'name', 'last_update'];
const allCustomerColumns = ['customer_id', 'store_id', 'first_name', 'last_name', 'email', 'address_id', 'active', 'create_date', 'last_update'];
const allFilmColumns = ['film_id', 'title', 'description', 'release_year', 'language_id', 'original_language_id', 'rental_duration', 'rental_rate', 'length', 'replacement_cost', 'rating', 'special_features', 'last_update'];
const allPaymentColumns = ['payment_id', 'customer_id', 'staff_id', 'rental_id', 'amount', 'payment_date', 'last_update'];
const allStaffColumns = ['staff_id', 'first_name', 'last_name', 'address_id', 'picture', 'email', 'store_id', 'active', 'username', 'password', 'last_update'];

describe('DML Exercises', () => {
  let sqlConnection = null;

  const readAndExecute = (filename, callback) => new Promise((fulfill, reject) => {
    const sql = fs.readFileSync(path.join(__dirname, `${filename}.sql`), 'utf-8');
    sqlConnection.query(sql, (err, results) => {
      if (err) return reject(err);

      if (typeof results === 'null') return reject('Exercise has not yet been completed');

      fulfill(results);
    });
  });

  const expectReturnedColumns = (expectedColumns, results) => {
    expect(typeof results).to.not.equal('null');

    expect(results instanceof Array).to.equal(true, 'Exercise has not been started');

    expect(results.every(r => Object.keys(r).length)).to.equal(true);
    
    expectedColumns.forEach((col, i) => {
      results.forEach((result, j) => expect(Object.keys(result)[i]).to.equal(col, `Expected ${col} to be column #${i+1} in result set.`))
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

  it('01-select-statement.sql', () =>
    readAndExecute('01-select-statement')
    .then(results => {
      expectReturnedColumns(allActorColumns, results[0]);
      expect(results[0].length).to.equal(200, 'Expected to see a result set containing all 200 actors.');

      expectReturnedColumns(['last_name'], results[1]);
      expect(results[1].length).to.equal(200);

      expectReturnedColumns(['title', 'description', 'rental_duration', 'rental_rate', 'total_rental_cost'], results[2]);
      expect(results[2].length).to.equal(1000);
    })
  );

  it('02-distinct.sql', () =>
    readAndExecute('02-distinct')
    .then((results) => {
      expectReturnedColumns(['last_name'], results);
      expect(results.length).to.equal(121, 'Expected to see a result set containing all 121 last names.');
    })
  );

  it('03-where.sql', () =>
    readAndExecute('03-where')
    .then((results) => {
      expectReturnedColumns(['title', 'description', 'rating', 'length'], results[0]);
      expect(results[0].length).to.equal(46);
      expect(results[0].every(r => r.length >= 180)).to.equal(true);

      expectReturnedColumns(['payment_id', 'amount', 'payment_date'], results[1]);
      expect(results[1].length).to.equal(15730);
      expect(results[1].every(r => moment(r.payment_date).isAfter(moment('2005-05-27')))).to.equal(true);
    })
  );

  it('04-and.sql', () =>
    readAndExecute('04-and')
    .then((results) => {
      expectReturnedColumns(['payment_id', 'amount', 'payment_date'], results[0]);
      expect(results[0].length).to.equal(167);
      expect(results[0].every(result => moment(result.payment_date).isAfter(moment('2005-05-27 00:00:00')))).to.equal(true);
      expect(results[0].every(result => moment(result.payment_date).isBefore(moment('2005-05-27 23:59:59')))).to.equal(true);

      expectReturnedColumns(allCustomerColumns, results[1]);
      expect(results[1].length).to.equal(54);
      expect(results[1].every(r => r.active)).to.equal(true);
      expect(results[1].every(r => r.last_name[0] === 'S')).to.equal(true);
    })
  );

  it('05-or.sql', () =>
    readAndExecute('05-or')
    .then((results) => {
      expectReturnedColumns(allCustomerColumns, results[0]);
      expect(results[0].length).to.equal(336);
      expect(results[0].every(r => r.store_id === 1 || r.last_name[0] === 'D')).to.equal(true);

      expectReturnedColumns(allCategoryColumns, results[1]);
      expect(results[1].length).to.equal(4);
      expect(results[1].every(r => r.category_id > 4 && r.name[0] === 'C' || r.name[0] === 'S' || r.name[0] === 'T')).to.equal(true);
    })
  );

  it('06-in.sql', () =>
    readAndExecute('06-in')
    .then((results) => {
      expectReturnedColumns(['phone', 'district'], results[0]);
      expect(results[0].length).to.equal(24);
      expect(results[0].every(r => ['California', 'England', 'Taipei', 'West Java'].includes(r.district))).to.equal(true);

      expectReturnedColumns(['payment_id', 'amount', 'payment_date'], results[1]);
      expect(results[1].length).to.equal(458);
      expect(results[1].every(r => ['2005-05-25', '2005-05-27', '2005-05-29'].includes(moment(r.payment_date).format('YYYY-MM-DD')))).to.equal(true);
    })
  );

  it('07-between.sql', () =>
    readAndExecute('07-between')
    .then((results) => {
      expectReturnedColumns(allPaymentColumns, results[0]);
      expect(results[0].every(r => moment(r.payment_date).isBetween(moment('2005-05-25 00:00:00'), moment('2005-05-26 23:59:59')))).to.equal(true);

      expectReturnedColumns(['title', 'description', 'release_year', 'total_rental_cost'], results[1]);
      expect(results[1].every(r => r.description.split(' ').length >= 18 && r.description.split(' ').length <= 20)).to.equal(true);
    })
  );

  it('08-like.sql', () =>
    readAndExecute('08-like')
    .then((results) => {
      expectReturnedColumns(['title', 'description', 'release_year'], results[0]);
      expect(results[0].every(r => r.description.substring(0, 12) === 'A Thoughtful')).to.equal(true);

      expectReturnedColumns(['title', 'description', 'rental_duration'], results[1]);
      expect(results[1].every(r => r.description.substring(r.description.length - 4, r.description.length) === 'Boat')).to.equal(true);

      expectReturnedColumns(['title', 'length', 'description', 'rental_rate'], results[2]);
      expect(results[2].every(r => r.length > 180)).to.equal(true);
    })
  );

  it('09-limit.sql', () =>
    readAndExecute('09-limit')
    .then((results) => {
      expectReturnedColumns(allPaymentColumns, results[0]);
      expect(results[0].length).to.equal(20);
      expect(results[0][0].payment_id).to.equal(1);

      expectReturnedColumns(['payment_date', 'amount'], results[1]);
      expect(results[1].length).to.equal(1000);
      expect(results[1].every(r => r.amount > 5)).to.equal(true);
    })
  );

  it('10-is-it-null.sql', () =>
    readAndExecute('10-is-it-null')
    .then((results) => {
      expectReturnedColumns(allStaffColumns, results[0]);
      expect(results[0][0].password).to.equal(null);

      expectReturnedColumns(['staff_id', 'first_name', 'last_name', 'address_id', 'picture', 'email', 'store_id', 'active', 'username', 'last_update'], results[1]);
      expect(results[1][0].staff_id).to.equal(1);
    })
  );

  it('11-order-by.sql', () =>
    readAndExecute('11-order-by')
    .then((results) => {
      expectReturnedColumns(allFilmColumns, results[0]);
      expect(results[0].length).to.equal(1000);
      expect(results[0]).to.be.sortedBy('length');

      expectReturnedColumns(['rating'], results[1]);
      expect(results[1].length).to.equal(5);
      expect(results[1].map(r => r.rating)).to.deep.equal(['NC-17', 'R', 'PG-13', 'PG', 'G']);

      expectReturnedColumns(['payment_date', 'amount'], results[2]);
      expect(results[2].length).to.equal(20);
      expect(results[2]).to.be.sortedBy('amount', true);

      expectReturnedColumns(['title', 'description', 'special_features', 'length', 'rental_duration'], results[3]);
      expect(results[3].length).to.equal(10);
      expect(results[3].every(r => r.special_features.includes('Behind the Scenes') && r.length < 120 && r.rental_duration >= 5 && r.rental_duration <= 7)).to.equal(true);
      expect(results[3]).to.be.sortedBy('length', true);
    })
  );

  it('12-inner-join', () => 
    readAndExecute('12-inner-join')
    .then(results => {
      expectReturnedColumns(['rental_date', 'first_name', 'last_name', 'title'], results);
      expect(results.length).to.equal(8);
      results.forEach(r => expect(moment.utc(r.rental_date).format('MM/DD/YYYY')).to.equal('05/25/2005'));
    })
  );
});
