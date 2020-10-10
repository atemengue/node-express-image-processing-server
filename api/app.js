/** @format */

const express = require('express');
const path = require('path');
const app = express();

const pathIndex = path.resolve(__dirname, '../client/index.html');
app.use('/*', (request, response) => {
  response.sendFile(pathIndex);
});

module.exports = app;
