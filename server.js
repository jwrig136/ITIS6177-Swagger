const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
//const cors = require('cors');


const options = {
swaggerDefinition: {
	openapi:"3.0.0",
	info: {
		title: 'Jahvonni Wright API',
		version: '1.0.0',
		description: 'API commands used to read SQL databse',
	},
	host: 'http://68.183.139.171:3000',
	basePath: '/',
	},
	apis: ['./server.js'],
};

const specs = swaggerJsdoc(options);

const mariadb = require('mariadb/callback');
const pool = mariadb.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'sample',
	port: 3306,
	connectionLimit: 5
});

app.use('/docs', swaggerUI.serve, swaggerUI.setup(specs));
//app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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
 */

app.get('/agents', (req, res) => {

 pool.query('SELECT * FROM agents', function (error, results) {
        if (error) throw error;
        res.json(results);
    })

})

/**
 * @swagger
 * /company/companyNames:
 *   get:
 *     description: Return all company names from company table
 *     produces:
 *       -application/json
 *     responses:
 *       200:
 *         description: Successful
 */
app.get('/company/companyNames', (req, res) => {

 pool.query('SELECT company_name FROM company', function (error, results) {
        if (error) throw error;
        res.json(results);
    })

})

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
app.get('/orders/ordAmount=2000', (req, res) => {

 pool.query('SELECT ord_num, ord_amount FROM orders WHERE ord_amount = 2000', function (error, results) {
        if (error) throw error;
        res.json(results);
    })

})

/**
 * @swagger
 * /agents:
 *   get:
 *     description: Return all agents
 *     produces:
 *       -application/json
 *     responses:
 *       200:
 *         description: Object agents containing array of agents
 */
app.get('/agents', (req, res) => {

 pool.query('SELECT * FROM agents', function (error, results) {
        if (error) throw error;
        res.json(results);
    })

})

/**
 * @swagger
 * components:
 *   schemas:
 *     Company:
 *       type: object
 *       required:
 *         - company_id
 *         - company_name
 *         - company_city
 *       properties:
 *         company_id:
 *           type: string
 *         company_name:
 *           type: string
 *         company_city:
 *           type: string
 *       example:
 *         company_id: "20"
 *         company_name: Amazon
 *         company_city: Seattle
 */

/**
 * @swagger
 * /company/signup:
 *   post:
 *     summary: Create a new company
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Company'
 *     responses:
 *       200:
 *         description: Successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Company'
 *       500:
 *         description: Server Error
 */
app.post('/company/signup', async (req, res) => {
    const {company_id, company_name, company_city} = req.body;

    pool.query('INSERT INTO company (COMPANY_ID, COMPANY_NAME, COMPANY_CITY) VALUES (?, ?, ?)',[company_id.toString(), company_name.toString(), company_city.toString()],(err,result)=>{
        if(err){
            throw err;
        }else{
            res.send(result);
        }

    })
})

/**
 * @swagger
 * /company/{id}:
 *  put:
 *    summary: Update the company Name
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Company'
 *    responses:
 *      200:
 *        description: Successful
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Company'
 *      404:
 *        description: The company was not found
 *      500:
 *        description: Some error happened
 */
app.put('/company/:id', async (req,res)=>{
    const {company_id, company_name, company_city} = req.body;

    pool.query('UPDATE company SET COMPANY_ID = ?, COMPANY_NAME = ?, COMPANY_CITY = ? WHERE COMPANY_ID = ?',[company_id.toString(), company_name.toString(), company_city.toString(), company_id.toString()],(err,result)=>{
        if(err){
            throw err;
        }else{
            res.send(result);
        }

    })
});

/**
 * @swagger
 * /company/{id}:
 *   delete:
 *     summary: Remove the company by id
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The company id
 * 
 *     responses:
 *       200:
 *         description: The company was deleted
 *       404:
 *         description: The company was not found
 */
app.delete('/company/{id}', async (req,res)=>{
	const id = req.params.id

    pool.query('DELETE FROM company WHERE COMPANY_ID = ?',[company_id.toString()],(err,result)=>{
        if(err){
            throw err;
        }else{
            res.send(result);
        }

    })
});

app.listen(port, () => {
  console.log(`Example app listening at http//localhost:${port}`);
});

