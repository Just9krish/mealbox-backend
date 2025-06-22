import mongoose from 'mongoose';
import { mongoConnectionString } from '../constant.js';

console.log(mongoConnectionString);

const connetDatabase = () =>
  mongoose.connect(mongoConnectionString).then((data) => {
    console.log(`mongodb connected with server ${data.connection.host}`);
  });

export default connetDatabase;
