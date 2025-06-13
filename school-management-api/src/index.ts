import express from 'express';
import { PrismaClient } from './generated/prisma';
import userRoutes from './routes/user.routes';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use('/users', userRoutes);

app.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});