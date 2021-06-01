const crypto = require("crypto");

/* -------------------------------  GENERAL ------------------------------- */
exports.compareLogic = (type, ...items) => type === "and" ? items.every(Boolean) : (type === "or" ? items.some(Boolean) : "Missing type parameter");

exports.getRandomInt = (min, max, cur = null) => {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    return (num === cur) ? getRandomInt(min, max, cur) : num;
};

exports.castObjectNumbers = (obj, ...objectArrayKeys) => {
    return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key,
        objectArrayKeys.includes(key)
            ? value.map(e => this.castObjectNumbers(e))
            : (/^[+-]?\d*\.?\d+(?:[Ee][+-]?\d+)?$/.test(value) ? (+value) : value)
    ]));
};

/* -------------------------------- ARRAYS ------------------------------- */
exports.arrayIntersect = (...arrays) => [...arrays].reduce((acc, cur) => acc.filter(e => cur.includes(e)));

exports.countItems = (arr) => {
    const map = arr.reduce((acc, cur) => acc.set(cur, (acc.get(cur) || 0) + 1), new Map());
    return [...map.entries()];
};

exports.getArrayDiff = (a, b) => a.filter(e => !b.includes(e)).concat(b.filter(e => !a.includes(e)));

exports.sumArray = (arr, fn) => arr.reduce((acc, cur) => acc += fn?.(cur) ?? cur, 0);

exports.rotateArrayPos = (direction, current, length) => {
    if (direction === "next") { return current + 1 < length ? current + 1 : 0; }
    else if (direction === "prev") { return current - 1 >= 0 ? current - 1 : length - 1; }
};

exports.uniqueArrayFilter = (...arrays) => {
    const all = [].concat(...arrays);
    const nonUnique = all.filter((set => value => set.has(value) || !set.add(value))(new Set));
    return all.filter(e => !nonUnique.includes(e));
};

exports.uniqueArrayMerge = (oldArray, newArrays) => [...new Set([...new Set(oldArray), ...[].concat(...newArrays)])];

exports.sortArray = (arr, key, isDesc = true, isNumber = false) => {
    if (arr === undefined) return console.debug("Array reference is undefined in sortArray(...)");
    if (!arr?.length) return [];

    const sorted = [...arr];

    sorted.sort((a, b) => {
        const first = a[key] ?? (isNumber ? 0 : "");
        const second = b[key] ?? (isNumber ? 0 : "");

        const comparison = isNumber ? second - first : String(second).localeCompare(String(first));
        return isDesc ? comparison : comparison * -1;
    });

    return sorted;
};

/* ----------------------------- CRYPTOGRAPHY ---------------------------- */
exports.hash = (method, input, outputType = "hex") => crypto.createHash(method).update(input).digest(outputType);

exports.randomBase64 = (length) => crypto.randomBytes(length).toString("base64").substr(0, length);

/* -------------------------------- DATES -------------------------------- */
exports.checkIsExpired = (date) => Date.now() - new Date(date) > 0;

exports.getFutureDate = ({ seconds = 0, minutes = 0, hours = 0, days = 0, months = 0 } = {}) => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    date.setMinutes(date.getMinutes() + minutes);
    date.setHours(date.getHours() + hours);
    date.setDate(date.getDate() + days);
    date.setMonth(date.getMonth() + months);
    return date;
};

exports.getIsoDate = (date, type = "datetime") => {
    const isoDate = new Date(`${date ? date : new Date()}${date ? " UTC" : ""}`).toISOString();
    switch (type.toLowerCase()) {
        case "date": return isoDate.substring(0, 10);
        case "datetime": return `${isoDate.substring(0, 10)} ${isoDate.substring(11, 19)}`;
        case "time": return isoDate.substring(11, 19);
    }
};

/* --------------------------- FORM VALIDATION --------------------------- */
exports.emptyStringsToNull = obj => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, value === "" ? null : value]));

exports.parseJSON = (str) => {
    try { return JSON.parse(str); }
    catch (e) { return str; }
};

exports.regexEscape = (string) => string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

exports.validateForm = (reqs, key, value, res, refreshedAccessToken) => {
    const r = reqs[key];

    const errors = [];

    if (r?.isRequired && !value) errors.push(`${r.name} is required`);

    if (r?.maxLen && value !== null && value.length > r.maxLen) errors.push(`${r.name} cannot be greater than ${r.maxLen} characters`);

    if (r?.minLen && (value === null || value.length < r.minLen)) errors.push(`${r.name} cannot be less than ${r.minLen} characters`);

    if (r?.type && value !== null && !this.validateInput(r.type, value)) errors.push(`${r.name} is invalid`);

    if (errors.length) res.send({ success: false, message: errors.join("\n"), refreshedAccessToken });

    return errors.length === 0;
};

exports.validateInput = (type, value) => {
    switch (type) {
        case "integer": {
            return /^[0-9]+$/.test(value);
        } case "decimal": {
            const v = String(value);
            if (!/^[0-9.]+$/.test(v)) return false;
            if (v.split(".")[0].length > 10) return false;
            return true;
        } case "date": case "datetime": {
            return /^([0-9]{2,4})-([0-1][0-9])-([0-3][0-9])(?:( [0-2][0-9]):([0-5][0-9]):([0-5][0-9]))?(.[0-9]{1,6})?$/.test(value);
        } case "email": {
            return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value);
        } case "url": {
            return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
        } default:
            throw new Error("Missing 'type' argument in validate function");
    }
};

exports.validateLength = (e, name, length, greater = true) => {
    return (greater ? e.length > length : e.length < length) ? `${name} cannot be ${greater ? "greater" : "less"} than ${length} characters` : "";
};

exports.validatePassword = ({ password, res, refreshedAccessToken }) => {
    const errors = [];

    if (!/[a-z]+/.test(password)) errors.push("Password requires a lowercase letter");
    if (!/[A-Z]+/.test(password)) errors.push("Password requires an uppercase letter");
    if (!/\d+/.test(password)) errors.push("Password requires a number");
    if (!/[!@#$%^&]+/.test(password)) errors.push("Password requires a symbol (!@#$%^&)");

    if (errors.length) res.send({ success: false, message: errors.join("\n"), refreshedAccessToken });

    return errors.length ? false : true;
};

/* ------------------------------ FORMATTING ----------------------------- */
exports.capitalize = (string) => string[0].toUpperCase() + string.substring(1);

exports.formatBytes = (bytes) => {
    if (bytes < 1) { return "0 B"; }
    const power = Math.floor(Math.log2(bytes) / 10);
    return `${(bytes / (1024 ** power)).toFixed(2)} ${("KMGTPEZY"[power - 1] || "")}B`;
};

exports.formatDate = (dateTime, type = "date") => {
    const [year, month, day, time] = [dateTime.substring(0, 4), dateTime.substring(5, 7), dateTime.substring(8, 10), dateTime.substring(11)];
    switch (type.toLowerCase()) {
        case "date": return `${months[+month]} ${day}, ${year}`;
        case "datetime": return `${months[+month]} ${day}, ${year} | ${new Date(`1970-01-01T${time}`).toLocaleTimeString({}, {hour: "numeric", minute: "numeric"})}`;
        case "time": return new Date(`1970-01-01T${time}`).toLocaleTimeString({}, {hour: "numeric", minute: "numeric"});
        default:
    }
};

exports.leadZeros = (num, places) => String(num).padStart(places, "0");

/* ---------------------------- ROUTE HANDLING --------------------------- */
exports.handleErrors = fn => (req, res) => {
    fn(req, res).catch(e => {
        console.error(e);
        return res.send({ success: false, message: e.message });
    });
};