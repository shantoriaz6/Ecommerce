import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();
const isDev = process.env.NODE_ENV !== "production";
const allowedOrigins = String(process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "")
   .split(",")
   .map((o) => o.trim())
   .filter(Boolean);

const corsOptions = {
   // In dev: reflect whatever Origin the browser sends (works across Vite ports).
   // In prod: restrict to configured allowed origins.
   origin: isDev
      ? true
      : (origin, callback) => {
            if (!origin) return callback(null, true);
            if (!allowedOrigins.length) return callback(null, false);
            return callback(null, allowedOrigins.includes(origin));
         },
   credentials: true,
   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
   optionsSuccessStatus: 204,
};

// Handle preflight BEFORE any auth middlewares/routes.
app.use((req, res, next) => {
   if (req.method !== "OPTIONS") return next();
   return cors(corsOptions)(req, res, () => res.sendStatus(204));
});

app.use(cors(corsOptions));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// routes import

import userRoutes from './routes/user.route.js';
import productRoutes from './routes/product.route.js';
import orderRoutes from './routes/order.route.js';
import adminRoutes from './routes/admin.route.js';
import cartRoutes from './routes/cart.route.js';
import paymentRoutes from './routes/payment.route.js';
import deliverymanRoutes from './routes/deliveryman.route.js';
import chatRoutes from './routes/chat.route.js';

//routes decleration
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/payment', paymentRoutes);
app.use('/api/v1/deliveryman', deliverymanRoutes);
app.use('/api/v1/chat', chatRoutes);


export { app };
