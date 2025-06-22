import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from 'morgan';
import { errorHandlerMiddleware } from './middleware/index.js';
import registerRoutes from './routes/index.js';
import { ErrorHandler } from './utils/index.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(logger('dev'));
app.use('/', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// default check route
app.get('/', (_, res) => {
  res.send('API Running');
});

// Import routes
registerRoutes(app);

// Catch-all route handler for unmatched routes
app.use((req, res, next) => {
  throw new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404);
});

// If error
app.use(errorHandlerMiddleware);

export default app;
