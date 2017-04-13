
import express from "express";
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const extended = { extended: false };

app.use(cors());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded(extended));
// parse application/json
app.use(bodyParser.json(extended));
app.all('/', (req, res, next) => {

  res.json({
    message: 'OK',
    data: ''
  });

});

export default app;