/** @format */

const path = require('path');
const { Worker, isMainThread } = require('worker_threads');

const pathToResizeWorker = path.resolve(__dirname, 'resizeWorker.js');
const pathToMonochromeWorker = path.resolve(__dirname, 'monochromeWorker.js');

function uploadPathResolver(filename) {
  return path.resolve(__dirname, '../uploads', filename);
}

function imageProcessor(filename) {
  let monochromeWorkerFinished = false;
  let resizeWorkerFinished = false;

  const sourcePath = uploadPathResolver(filename);
  const resizedDestination = uploadPathResolver(`resized-${filename}`);
  const monochromeDestination = uploadPathResolver(`monochrome-${filename}`);

  return new Promise((resolse, reject) => {
    if (isMainThread) {
      try {
        const resizeWorker = new Worker(pathToResizeWorker, {
          workerData: { source: sourcePath, destination: resizedDestination },
        });

        const monochromeWorker = new Worker(pathToMonochromeWorker, {
          workerData: {
            source: sourcePath,
            destination: monochromeDestination,
          },
        });

        resizeWorker.on('message', (message) => {
          resizeWorkerFinished = true;
          if (monochromeWorkerFinished) {
            resolse('resizeWorker finished processing');
          }
        });

        resizeWorker.on('error', (error) => {
          reject(new Error(error.message));
        });

        resizeWorker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Exited with status code ${code}`));
          }
        });

        monochromeWorker.on('message', () => {
          monochromeWorkerFinished = true;
          resolse('monochromeWorker finished processing');
        });

        monochromeWorker.on('error', (error) => {
          reject(new Error(error.message));
        });

        monochromeWorker.on('exit', (code) => {
          if (code !== 0) {
            reject(new Error(`Exited with status code ${code}`));
          }
        });
      } catch (error) {
        reject();
      }
    } else {
      reject(new Error('not on main thread'));
    }
  });
}

module.exports = imageProcessor;
