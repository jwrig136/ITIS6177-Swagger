const express = require("express");
const app = express();
const port = 3000;
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUI = require("swagger-ui-express");
const mariadb = require("mariadb");
const { body, param, validationResult } = require("express-validator");

app.use(express.json());

const pool = mariadb.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    database: "sample",
    port: 3306,
    connectionLimit: 5,
});

const options = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "SQL API",
            version: "1.0.0",
            description: "API used to read SQL Database",
        },
        host: "http://68.183.139.171:3000",
        basePath: "/",
    },
    apis: ["./server.js"],
};

const specs = swaggerJsdoc(options);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(specs));

/**
 * @swagger
 * /agents:
 *   get:
 *     description: Return all agents
 *     produces:
 *       -application/json
 *     responses:
 *       200:
 *         description: Successful
 *       500:
 *         description: Error in getting agents`
 */

app.get("/agents", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const results = await conn.query("SELECT * FROM agents");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /company:
 *   get:
 *     description: Return all company names from company table
 *     produces:
 *       -application/json
 *     responses:
 *       200:
 *         description: Successful
 */
app.get("/company", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const results = await conn.query("SELECT * FROM company");
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /orders/ordAmount=2000:
 *   get:
 *     description: Return all orders where order amoutn equals 2000
 *     produces:
 *       -application/json
 *     responses:
 *       200:
 *         description: Successful
 */
app.get("/orders/ordAmount=2000", async (req, res) => {
    try {
        const conn = await pool.getConnection();
        const results = await conn.query(
            "SELECT ord_num, ord_amount FROM orders WHERE ord_amount = 2000"
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - COMPANY_ID
 *         - COMPANY_NAME
 *         - COMPANY_CITY
 *       properties:
 *         COMPANY_ID:
 *           type: string
 *         COMPANY_NAME:
 *           type: string
 *         COMPANY_CITY:
 *           type: string
 *       example:
 *         COMPANY_ID: "20"
 *         COMPANY_NAME: Amazon
 *         COMPANY_CITY: Seattle
 */

/**
 * @swagger
 * /company:
 *   post:
 *     summary: Add a new company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: The company was added
 *       500:
 *         description: Error adding new company
 */
app.post(
    "/company",
    [
        body("COMPANY_ID").isString().notEmpty().withMessage("ID is required"),
        body("COMPANY_NAME").isString().optional(),
        body("COMPANY_CITY").isString().optional(),
    ],
    async (req, res) => {
        const errs = validationResult(req);
        if (!errs.isEmpty()) {
            return res.status(400).json({ errs: errs.array() });
        }
        const { COMPANY_ID, COMPANY_NAME, COMPANY_CITY } = req.body;

        try {
            const conn = await pool.getConnection();
            const results = await conn.query(
                "INSERT INTO company (COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES (?, ?, ?)",
                [COMPANY_ID, COMPANY_NAME, COMPANY_CITY]
            );
            res.status(200).send("Customer successfully added");
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

/**
 * @swagger
 * /company/{id}:
 *  put:
 *    summary: Update the company
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The company ID
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              COMPANY_ID:
 *                type: string
 *              COMPANY_NAME:
 *                type: string
 *              COMPANY_CITY:
 *                type: string
 *    responses:
 *       200:
 *         description: The company was updated
 *       404:
 *         description: The company was not found
 *       500:
 *         description: Erorr getting company
 */

app.put("/company/:id", [
    param('id').isString(),
    body("COMPANY_ID").isString().notEmpty().withMessage("ID is required"),
    body("COMPANY_NAME").isString().optional(),
    body("COMPANY_CITY").isString().optional(),
], async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        return res.status(400).json({ errs: errs.array() });
    }
    const id = req.params.id;
    console.log(req.params.id);
    const { COMPANY_ID, COMPANY_NAME, COMPANY_CITY } = req.body;

    try {
        const conn = await pool.getConnection();
        const results = await conn.query(
            "UPDATE company SET COMPANY_ID = ?, COMPANY_NAME = ?, COMPANY_CITY = ? WHERE COMPANY_ID = ?",
            [COMPANY_ID, COMPANY_NAME, COMPANY_CITY, id]
        );
        res.status(200).send("Customer successfully updated");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /company/{id}:
 *  patch:
 *    summary: Update the company name and city
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: The company ID
 *        schema:
 *          type: string
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              COMPANY_NAME:
 *                type: string
 *              COMPANY_CITY:
 *                type: string
 *    responses:
 *       200:
 *         description: The company was updated
 *       404:
 *         description: The company was not found
 *       500:
 *         description: Erorr getting company
 */
app.patch("/company/:id", [
    param('id').isString(),
    body("COMPANY_NAME").isString().optional(),
    body("COMPANY_CITY").isString().optional(),
], async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) {
        return res.status(400).json({ errs: errs.array() });
    }
    const id = req.params.id;
    console.log(req.params.id);
    const { COMPANY_NAME, COMPANY_CITY } = req.body;

    try {
        const conn = await pool.getConnection();
        const results = await conn.query(
            "UPDATE company SET COMPANY_NAME = ?, COMPANY_CITY = ? WHERE COMPANY_ID = ?",
            [COMPANY_NAME, COMPANY_CITY, id]
        );
        res.status(200).send("Customer successfully updated");
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * @swagger
 * /company/{id}:
 *   delete:
 *     summary: Remove a company
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company ID
 *     responses:
 *       200:
 *         description: The company was deleted
 *       404:
 *         description: The company was not found
 *       500:
 *         description: Erorr getting company
 */
app.delete("/company/:id",
    [
        param('id').isString(),
    ], async (req, res) => {
        const errs = validationResult(req);
        if (!errs.isEmpty()) {
            return res.status(400).json({ errs: errs.array() });
        }
        const id = req.params.id;

        try {
            const conn = await pool.getConnection();
            const results = await conn.query(
                "DELETE FROM company WHERE COMPANY_ID = ?",
                [id]
            );
            res.status(200).send("Customer successfully deleted");
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

app.listen(port, () => {
    console.log(`Example app listening at http//localhost:${port}`);
});

