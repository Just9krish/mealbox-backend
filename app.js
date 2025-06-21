import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import logger from 'morgan';
import { errorMiddleware } from './middleware';
import { ErrorHandler } from './utils';

const app = express();

app.use(express.json());
// Allow requests from the specified frontend domain
app.use(cors());
app.use(logger('dev'));
app.use('/', express.static('uploads'));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Import routes

// default check route
app.get('/', (_, res) => {
  res.send('API Running');
});

// Routes

// Catch-all route handler for unmatched routes
app.use((req, res, next) => {
  throw new ErrorHandler(`Can't find ${req.originalUrl} on this server!`, 404);
});

// If error
app.use(errorMiddleware);

export default app;
