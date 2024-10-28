const knex = require('knex')({
    client: 'sqlite3', // or 'better-sqlite3'
    connection: {
        filename: './mydb.sqlite',
    },
});
knex.schema.hasTable('users').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('users', function (t) {
            t.increments('id').primary();
            t.string('name', 100);
            t.string('no', 100);
        });
    }
});
knex.schema.hasTable('scores').then(function (exists) {
    if (!exists) {
        return knex.schema.createTable('scores', function (t) {
            t.increments('id').primary();
            t.string('name', 100);
            t.string('no', 100);
            t.string('title', 100);
            t.string('subject', 100);
            t.string('level', 100);
            t.string('score', 100);
            t.text('items', 100);
            t.text('values', 100);
        });
    }
});
exports.db=knex