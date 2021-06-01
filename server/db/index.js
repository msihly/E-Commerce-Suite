const { createPool } = require("mysql2/promise");
const { DB_SERVER_NAME, DB_USERNAME, DB_PASSWORD, DB_NAME } = process.env;

exports.db = createPool({
    host: DB_SERVER_NAME,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME
});

module.exports = {
    ...module.exports,
    ...require("./authToken.js"),
    ...require("./cart.js"),
    ...require("./customer.js"),
    ...require("./employee.js"),
    ...require("./expense.js"),
    ...require("./inflow.js"),
    ...require("./listing.js"),
    ...require("./order.js"),
    ...require("./product.js"),
    ...require("./photo.js"),
    ...require("./user.js"),
};