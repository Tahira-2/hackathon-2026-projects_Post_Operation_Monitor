import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import extractRouter from './routes/extract';
import specialistsRouter from './routes/specialists';
import referralsRouter from './routes/referrals';
import patientRouter from './routes/patient';
import authRouter from './routes/v1/auth';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', project: 'RefAI' });
});

app.use('/api/extract', extractRouter);
app.use('/api/specialists', specialistsRouter);
app.use('/api/referrals', referralsRouter);
app.use('/api/patient', patientRouter);
app.use('/api/v1/auth', authRouter);

app.listen(PORT, () => {
  console.log(`RefAI backend running on port ${PORT}`);
});

export default app;
