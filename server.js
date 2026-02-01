const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const CONFIG_DIR = path.join(ROOT_DIR, "config");
const VALID_TYPES = new Set(["ui", "material"]);

app.use(express.json({ limit: "10mb" }));
app.use(express.static(ROOT_DIR));

const getConfigPath = (type) => path.join(CONFIG_DIR, `${type}.json`);

const readConfig = (type) => {
    try {
        const filePath = getConfigPath(type);
        if (!fs.existsSync(filePath)) {
            return {};
        }
        const raw = fs.readFileSync(filePath, "utf-8");
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        return {};
    }
};

const writeConfig = (type, data) => {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(getConfigPath(type), JSON.stringify(data, null, 2));
};

app.get("/api/config/:type", (req, res) => {
    const { type } = req.params;
    if (!VALID_TYPES.has(type)) {
        res.status(404).json({ error: "Unknown config type" });
        return;
    }
    res.json(readConfig(type));
});

app.post("/api/config/:type", (req, res) => {
    const { type } = req.params;
    if (!VALID_TYPES.has(type)) {
        res.status(404).json({ error: "Unknown config type" });
        return;
    }
    const data = req.body;
    if (!data || typeof data !== "object") {
        res.status(400).json({ error: "Invalid JSON body" });
        return;
    }
    writeConfig(type, data);
    res.json({ ok: true });
});

app.listen(PORT, () => {
    console.log(`Config server running at http://localhost:${PORT}`);
});
