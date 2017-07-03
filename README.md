# :tada: Fun with MySQL Exercises :tada:

> A bunch of testable exercises to get practice writing SQL.

The three learning objectives of these exercises are to learn:

1. How to perform CRUD operations against an existing database.
2. How to create a database.
3. How to create tables and design/model relationships between tables.

## Prerequisites

Make sure you have checked off the following tasks:

- [ ] Download and install [MySQL Community Edition](https://dev.mysql.com/downloads/mysql/) ***and*** [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
- [ ] [Follow these instructions](https://dev.mysql.com/doc/sakila/en/sakila-installation.html) to load a sample database called `sakila` into your MySQL server.
- [ ] Read as much of [this documentation](https://dev.mysql.com/doc/sakila/en/) as you can. This will help you understand the structure of the `sakila` sample database, and subsequently the exercises.

## Get Started

1. Fork this repository by clicking the Fork button in the top right hand side of this page. Once that's done, run the following commands in a terminal.

```sh
$ cd <a_place_you_like_to_keep_code>
$ git clone https://github.com/OriginCodeAcademy/startnow-db100-mysql-exercises
$ cd mysql-exercises
$ yarn
or
$ npm install
```

2. Create a new file called `config.js` within your newly cloned repository, then paste and fill in the following code.
```js
module.exports = {
    username: 'your_mysql_username',
    password: 'your_mysql_password'
};
```

3. Follow the instructions in the `.sql` files that are ordered alphanumerically in the `ex` folder of this repository.

## Recommended Development Process
1. Attempt an exercise in MySQL Workbench.
2. Paste solution in exercise file, run tests when ready.
3. If tests pass - Move onto the next exercise.
4. If tests don't pass - Rinse and repeat until it passes.

## Running Tests

```sh
$ yarn run test
or
$ npm run test
```

## Finished?

### :balloon::tada: Awesome work! :tada::balloon:

[Complete this form](https://www.github.com/OriginCodeAcademy/Cohort12/issues/new?title=MySQL%20Exercises&body=1.%20Where%20can%20I%20find%20your%20repository%3F%20(Paste%20the%20url%20of%20your%20repository%20below)%0A%0A2.%20What%20did%20you%20learn%20through%20these%20exercises%3F%0A%0A3.%20How%20could%20these%20exercises%20be%20improved%3F) to signal you've completed the exercises.

## Known Issues

- The tests run against a static instance of the sakila example database. You may need to "reset the database" if the tests stop working.