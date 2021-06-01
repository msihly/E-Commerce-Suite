try {
    const { NODE_ENV, PORT, SESSION_SECRET } = process.env;
    const express = require("express");
    const path = require("path");
    const cookieParser = require("cookie-parser");
    const multer = require("multer");
    const app = express();
    exports.app = app;

    if (NODE_ENV === "production") {
        app.enable("trust proxy");

        app.use((req, res, next) => {
            return req.headers["x-forwarded-proto"] !== "https" ? res.redirect(["https://", req.get("Host"), req.url].join("")) : next();
        });
    }

    app.use(cookieParser(SESSION_SECRET));
    app.use(multer({ limits: { fieldSize: 25 * 1024 * 1024 } }).any());
    app.use(express.json());

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Methods", "GET, POST");
        res.header("Access-Control-Allow-Headers", "Origin, Authorization, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.use(express.static(path.join(__dirname, "../client/build")));

    require("fs").readdirSync(path.join(__dirname, "routes")).forEach(file => require(`./routes/${file}`));

    app.get("*", (req, res) => {
        return res.sendFile(path.join(__dirname, "../client/build", "index.html"));
    });

    app.listen(PORT || 3011, () => console.log(`Listening on port ${PORT || 3011}...`));
} catch (e) { console.error(e); }