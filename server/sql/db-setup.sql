CREATE DATABASE ecommsuite;
USE ecommsuite;

/* --------------------------------- TABLES --------------------------------- */
CREATE TABLE IF NOT EXISTS user (
    userId          INT UNSIGNED NOT NULL AUTO_INCREMENT,
    username        VARCHAR(40) NOT NULL,
    passwordHash    VARCHAR(255) NOT NULL,
    accessLevel     TINYINT DEFAULT 0,
        PRIMARY KEY (userId)
);

CREATE TABLE IF NOT EXISTS token (
    tokenId         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    token           VARCHAR(2083) NOT NULL,
    expiryDate      DATETIME NOT NULL,
    userId          INT UNSIGNED NOT NULL,
        PRIMARY KEY (tokenId)
);

CREATE TABLE IF NOT EXISTS customer (
    customerId      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    firstName       VARCHAR(255) NOT NULL,
    lastName        VARCHAR(255),
    street          VARCHAR(255),
    city            VARCHAR(255),
    state           VARCHAR(255),
    zipCode         VARCHAR(30),
    phoneNumber     VARCHAR(30),
    userId          INT UNSIGNED,
        PRIMARY KEY (customerId)
);

CREATE TABLE IF NOT EXISTS referral (
    referrerId      INT UNSIGNED NOT NULL,
    referredId      INT UNSIGNED NOT NULL,
        PRIMARY KEY (referrerId, referredId)
);

CREATE TABLE IF NOT EXISTS invitation (
    invitationId    INT UNSIGNED NOT NULL AUTO_INCREMENT,
    inviteToken     VARCHAR(20) NOT NULL,
    expiryDate      DATETIME NOT NULL,
    isConsumed      TINYINT DEFAULT 0,
    customerId      INT UNSIGNED NOT NULL,
        PRIMARY KEY (invitationId)
);

CREATE TABLE IF NOT EXISTS employee (
    employeeId      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    firstName       VARCHAR(255) NOT NULL,
    lastName        VARCHAR(255),
    phoneNumber     VARCHAR(30),
    userId          INT UNSIGNED,
        PRIMARY KEY (employeeId)
);

CREATE TABLE IF NOT EXISTS product (
    productId           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    productName         VARCHAR(2083) NOT NULL,
    productType         VARCHAR(255) NOT NULL,
    productDescription  VARCHAR(2083),
    unitPrice           DECIMAL(10, 2) NOT NULL,
    dateAdded           DATE,
        PRIMARY KEY (productId)
);

CREATE TABLE IF NOT EXISTS flavor (
    flavorId        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    flavorName      VARCHAR(255) NOT NULL,
    flavorType      VARCHAR(255),
    productId       INT UNSIGNED NOT NULL,
        PRIMARY KEY (flavorId)
);

CREATE TABLE IF NOT EXISTS inflow (
    inflowId        INT UNSIGNED NOT NULL AUTO_INCREMENT,
    quantity        DECIMAL(10, 2) NOT NULL,
    dateAdded       DATE,
    datePaid        DATE,
    productId       INT UNSIGNED NOT NULL,
    flavorId        INT UNSIGNED,
        PRIMARY KEY (inflowId)
);

CREATE TABLE IF NOT EXISTS orders (
    orderId         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    orderDate       DATE NOT NULL,
    customerId      INT UNSIGNED NOT NULL,
    employeeId      INT UNSIGNED,
        PRIMARY KEY (orderId)
);

CREATE TABLE IF NOT EXISTS orderItem (
    orderId         INT UNSIGNED NOT NULL,
    lineItemNumber  INT UNSIGNED NOT NULL,
    quantity        DECIMAL(10, 2) NOT NULL,
    pricePaid       DECIMAL(10, 2) NOT NULL,
    productId       INT UNSIGNED NOT NULL,
    flavorId        INT UNSIGNED,
    listingId       INT UNSIGNED,
        PRIMARY KEY (lineItemNumber, orderId)
);

CREATE TABLE IF NOT EXISTS expense (
    expenseId           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    expenseType         VARCHAR(255) NOT NULL,
    expenseDescription  VARCHAR(2083),
    expenseAmount       DECIMAL(10, 2) NOT NULL,
    expenseStatus       VARCHAR(255),
    dateIncurred        DATE NOT NULL,
    datePaid            DATE,
    payeeId             INT UNSIGNED,
        PRIMARY KEY (expenseId)
);

CREATE TABLE IF NOT EXISTS cartItem (
    cartItemId      INT UNSIGNED NOT NULL AUTO_INCREMENT,
    quantity        DECIMAL(10, 2) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL,
    listingId       INT UNSIGNED,
    flavorId        INT UNSIGNED,
    productId       INT UNSIGNED NOT NULL,
    userId          INT UNSIGNED NOT NULL,
        PRIMARY KEY (cartItemId)
);

CREATE TABLE IF NOT EXISTS listing (
    listingId           INT UNSIGNED NOT NULL AUTO_INCREMENT,
    title               VARCHAR(2083) NOT NULL,
    hasWeights          TINYINT DEFAULT 0,
    strainType          CHAR(6),
    listingState        CHAR(9),
    dateAdded           DATETIME,
    sectionId           TINYINT NOT NULL,
    productId           INT UNSIGNED NOT NULL,
    photoId             INT UNSIGNED,
        PRIMARY KEY (listingId)
);

CREATE TABLE IF NOT EXISTS listingRate (
    listingRateId   INT UNSIGNED NOT NULL AUTO_INCREMENT,
    listingId       INT UNSIGNED NOT NULL,
    quantity        DECIMAL(10, 2) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL,
        PRIMARY KEY (listingRateId)
);

CREATE TABLE IF NOT EXISTS photo (
    photoId         INT UNSIGNED NOT NULL AUTO_INCREMENT,
    photoUrl		VARCHAR(95) NOT NULL,
    photoHash       VARCHAR(32) NOT NULL UNIQUE,
    originalName    VARCHAR(2083),
    dateCreated     DATETIME,
        PRIMARY KEY (photoId)
);

/* ------------------------------ FOREIGN KEYS ------------------------------ */
ALTER TABLE token
    ADD CONSTRAINT fk_token_user
        FOREIGN KEY (userId) REFERENCES user (userId);

ALTER TABLE customer
    ADD CONSTRAINT fk_customer_user
        FOREIGN KEY (userId) REFERENCES user (userId);

ALTER TABLE referral
    ADD CONSTRAINT fk_referral_customer_referrer
        FOREIGN KEY (referrerId) REFERENCES customer (customerId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_referral_customer_referred
        FOREIGN KEY (referredId) REFERENCES customer (customerId)
            ON DELETE CASCADE;

ALTER TABLE invitation
    ADD CONSTRAINT fk_invitation_customer
        FOREIGN KEY (customerId) REFERENCES customer (customerId)
            ON DELETE CASCADE,
    ADD INDEX inviteToken (inviteToken);

ALTER TABLE employee
    ADD CONSTRAINT fk_employee_user
        FOREIGN KEY (userId) REFERENCES user (userId);

ALTER TABLE expense
    ADD CONSTRAINT fk_expense_employee
        FOREIGN KEY (payeeId) REFERENCES employee (employeeId)
            ON DELETE SET NULL;

ALTER TABLE flavor
    ADD CONSTRAINT fk_flavor_product
        FOREIGN KEY (productId) REFERENCES product (productId)
            ON DELETE CASCADE;

ALTER TABLE inflow
    ADD CONSTRAINT fk_inflow_product
        FOREIGN KEY (productId) REFERENCES product (productId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_inflow_flavor
        FOREIGN KEY (flavorId) REFERENCES flavor (flavorId)
            ON DELETE SET NULL;

ALTER TABLE orders
    ADD CONSTRAINT fk_orders_customer
        FOREIGN KEY (customerId) REFERENCES customer (customerId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_orders_employee
        FOREIGN KEY (employeeId) REFERENCES employee (employeeId)
            ON DELETE CASCADE;

ALTER TABLE orderItem
    ADD CONSTRAINT fk_orderItem_orders
        FOREIGN KEY (orderId) REFERENCES orders (orderId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_orderItem_product
        FOREIGN KEY (productId) REFERENCES product (productId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_orderItem_flavor
        FOREIGN KEY (flavorId) REFERENCES flavor (flavorId)
            ON DELETE SET NULL,
    ADD CONSTRAINT fk_orderItem_listing
        FOREIGN KEY (listingId) REFERENCES listing (listingId)
            ON DELETE SET NULL;

ALTER TABLE cartItem
    ADD CONSTRAINT fk_cartItem_user
        FOREIGN KEY (userId) REFERENCES user (userId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_cartItem_listing
        FOREIGN KEY (listingId) REFERENCES listing (listingId)
            ON DELETE SET NULL,
    ADD CONSTRAINT fk_cartItem_product
        FOREIGN KEY (productId) REFERENCES product (productId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_cartItem_flavor
        FOREIGN KEY (flavorId) REFERENCES flavor (flavorId)
            ON DELETE SET NULL;

ALTER TABLE listing
    ADD CONSTRAINT fk_listing_product
        FOREIGN KEY (productId) REFERENCES product (productId)
            ON DELETE CASCADE,
    ADD CONSTRAINT fk_listing_photo
        FOREIGN KEY (photoId) REFERENCES photo (photoId)
            ON DELETE SET NULL;

ALTER TABLE listingRate
    ADD CONSTRAINT fk_listingRate_listing
        FOREIGN KEY (listingId) REFERENCES listing (listingId)
            ON DELETE CASCADE;