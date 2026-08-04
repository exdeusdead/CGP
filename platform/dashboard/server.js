const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "public")));
app.use("/", require("./routes"));

const PORT = process.env.CGP_DASHBOARD_PORT || 3300;

app.listen(PORT, () => {
    console.log(`CGP Dashboard listening on ${PORT}`);
});
