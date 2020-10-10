/** @format */

const express = require('express');
const path = require('path');
const { ap } = require('ramda');
const app = express();
const router = require('./src/router');

const pathIndex = path.resolve(__dirname, '../client/index.html');

app.use('/', router);
app.use(express.static(path.resolve(__dirname, 'uploads')));
app.use('/*', (request, response) => {
  response.sendFile(pathIndex);
});

module.exports = app;
