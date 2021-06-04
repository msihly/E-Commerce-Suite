const conn = require("./index.js").db;
const { getIsoDate } = require("../utils");

exports.getPhotos = async ({ photoHash, photoIds = [] }) => {
    const sql = `SELECT     *
                FROM        photo AS p
                ${photoIds.length > 0
                    ? `WHERE p.photoId IN (?${", ?".repeat(photoIds.length - 1)})`
                    : (photoHash ? `WHERE p.photoHash = ?` : "")
                };`;
    const [photos,] = await conn.query(sql, photoIds.length > 0 ? photoIds : [photoHash]);
    return photos;
};

exports.uploadPhoto = async ({ originalName, photoUrl, photoHash }) => {
    const sql = `INSERT INTO photo (dateCreated, originalName, photoUrl, photoHash) VALUES (?, ?, ?, ?);`;
    const [{ insertId: photoId },] = await conn.query(sql, [getIsoDate(), originalName, photoUrl, photoHash]);
    return photoId;
};