const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(`Uncaught exception! 🫠🫠`);
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB Connect successful'));

const PORT = process.env.PORT || 1000;
const server = app.listen(PORT, () =>
  console.log('listening.... On port:', PORT),
);

process.on('unhandledRejection', (err) => {
  console.log(`Unhandled Rejection 💀💀 Shutting down...`);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
