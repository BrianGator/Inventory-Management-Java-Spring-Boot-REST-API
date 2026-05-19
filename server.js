/**
 * Retail Inventory Management System - PREVIEW COMPATIBILITY LAYER
 * Written by Brian McCarthy
 * 
 * NOTE: This Node.js service is a shim to enable the AI Studio Interactive Preview.
 * The PRODUCTION/FINAL backend is implemented in Java Spring Boot (see /backend directory).
 */

import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  Timestamp,
  increment,
  writeBatch
} from "firebase/firestore";
import fs from "fs";
import winston from "winston";

// --- STRUCTURED LOGGING CONFIGURED (Logback-like configuration for Node) ---
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'rms-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Load Firebase Config
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

logger.info("Initializing Firebase with ProjectId: %s, DatabaseId: %s", 
  firebaseConfig.projectId, 
  firebaseConfig.firestoreDatabaseId || "(default)"
);

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    params: req.params,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});

const firebaseApp = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId)
  : getFirestore(firebaseApp);

const PORT = 3000;

// --- API V1 ROUTES (Versioning Implemented) ---
const v1Router = express.Router();

// 1. Store Management (MySQL-style Logical Data)
v1Router.get("/stores", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "stores"));
    const stores = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(stores);
  } catch (err) {
    logger.error("Failed to fetch stores: %o", err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

v1Router.post("/stores", async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, "stores"), req.body);
    logger.info("Store provisioned: %s", docRef.id);
    res.json({ id: docRef.id, ...req.body });
  } catch (err) {
    logger.error("Failed to create store: %o", err);
    res.status(500).json({ error: "Failed to create store" });
  }
});

// 2. Product Catalog (Master Registry)
v1Router.get("/products", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (err) {
    logger.error("Failed to fetch products: %o", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

v1Router.post("/products", async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, "products"), req.body);
    logger.info("Product added to catalog: %s (%s)", req.body.name, docRef.id);
    res.json({ id: docRef.id, ...req.body });
  } catch (err) {
    logger.error("Failed to create product: %o", err);
    res.status(500).json({ error: "Failed to create product" });
  }
});

v1Router.delete("/products/:id", async (req, res) => {
  try {
    await deleteDoc(doc(db, "products", req.params.id));
    logger.info("Product removed from catalog: %s", req.params.id);
    res.json({ success: true });
  } catch (err) {
    logger.error("Failed to delete product: %o", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// 3. Inventory Control (Stock Persistence)
v1Router.get("/inventory/:storeId", async (req, res) => {
  try {
    const q = query(collection(db, "inventory"), where("storeId", "==", req.params.storeId));
    const snapshot = await getDocs(q);
    const inventory = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(inventory);
  } catch (err) {
    logger.error("Failed to fetch inventory for store %s: %o", req.params.storeId, err);
    res.status(500).json({ error: "Failed to fetch inventory" });
  }
});

v1Router.post("/inventory", async (req, res) => {
  try {
    const { productId, storeId, stockLevel } = req.body;
    const q = query(collection(db, "inventory"), where("productId", "==", productId), where("storeId", "==", storeId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const invDoc = snapshot.docs[0];
      await updateDoc(invDoc.ref, { stockLevel: increment(stockLevel) });
      logger.info("Inventory adjustment performed: Store=%s Product=%s Delta=%d", storeId, productId, stockLevel);
      res.json({ id: invDoc.id, message: "Inventory updated" });
    } else {
      const docRef = await addDoc(collection(db, "inventory"), { productId, storeId, stockLevel });
      logger.info("New inventory allocation created: Store=%s Product=%s Stock=%d", storeId, productId, stockLevel);
      res.json({ id: docRef.id, ...req.body });
    }
  } catch (err) {
    logger.error("Inventory update failed: %o", err);
    res.status(500).json({ error: "Failed to update inventory" });
  }
});

// 4. Order Entry (Transactional Batch)
v1Router.post("/orders", async (req, res) => {
  const batch = writeBatch(db);
  try {
    const { customer, storeId, items, totalPrice } = req.body;
    logger.info("Starting order transaction for customer: %s", customer.email);
    
    let customerId;
    const qCust = query(collection(db, "customers"), where("email", "==", customer.email));
    const custSnap = await getDocs(qCust);
    if (custSnap.empty) {
      const custRef = await addDoc(collection(db, "customers"), customer);
      customerId = custRef.id;
      logger.info("New customer profile created: %s", customerId);
    } else {
      customerId = custSnap.docs[0].id;
    }

    const orderRef = doc(collection(db, "orders"));
    batch.set(orderRef, {
      customerId,
      storeId,
      totalPrice,
      date: Timestamp.now(),
      status: "completed"
    });

    for (const item of items) {
      const itemRef = doc(collection(db, "orderItems"));
      batch.set(itemRef, {
        orderId: orderRef.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1
      });

      const qInv = query(collection(db, "inventory"), where("productId", "==", item.productId), where("storeId", "==", storeId));
      const invSnap = await getDocs(qInv);
      if (!invSnap.empty) {
        batch.update(invSnap.docs[0].ref, { stockLevel: increment(-item.quantity) });
      }
    }

    await batch.commit();
    logger.info("Order transaction committed successfully: OrderID=%s", orderRef.id);
    res.json({ orderId: orderRef.id, success: true });
  } catch (err) {
    logger.error("Transaction failed, order rollback simulation: %o", err);
    res.status(500).json({ error: "Failed to place order" });
  }
});

// 5. MongoDB Simulation (Unstructured Product Reviews)
v1Router.get("/reviews/:productId", async (req, res) => {
  try {
    const q = query(collection(db, "reviews"), where("productId", "==", req.params.productId));
    const snapshot = await getDocs(q);
    const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(reviews);
  } catch (err) {
    logger.error("Review retrieval failed: %o", err);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

v1Router.post("/reviews", async (req, res) => {
  try {
    const docRef = await addDoc(collection(db, "reviews"), {
      ...req.body,
      timestamp: Timestamp.now()
    });
    logger.info("Unstructured review document inserted (NoSQL Pattern): %s", docRef.id);
    res.json({ id: docRef.id, ...req.body });
  } catch (err) {
    logger.error("Review insertion failed: %o", err);
    res.status(500).json({ error: "Failed to add review" });
  }
});

// 6. Analytics Procedures (Logical Join Simulation)
v1Router.get("/analytics/monthly-sales-by-store", async (req, res) => {
  try {
    const { year, month } = req.query;
    const ordersSnap = await getDocs(collection(db, "orders"));
    const storeSales = {};
    
    ordersSnap.docs.forEach(d => {
      const data = d.data();
      const date = data.date.toDate();
      if (date.getFullYear() == year && (date.getMonth() + 1) == month) {
        storeSales[data.storeId] = (storeSales[data.storeId] || 0) + data.totalPrice;
      }
    });

    const result = Object.entries(storeSales).map(([storeId, totalSales]) => ({
      store_id: storeId,
      total_sales: totalSales,
      sale_month: month,
      sale_year: year
    }));

    res.json(result);
  } catch (err) {
    logger.error("Analytics procedure 'getMonthlySales' failed: %o", err);
    res.status(500).json({ error: "Analytics failed" });
  }
});

v1Router.get("/analytics/total-company-sales", async (req, res) => {
  try {
    const { year, month } = req.query;
    const ordersSnap = await getDocs(collection(db, "orders"));
    let totalSales = 0;
    
    ordersSnap.docs.forEach(d => {
      const data = d.data();
      const date = data.date.toDate();
      if (date.getFullYear() == year && (date.getMonth() + 1) == month) {
        totalSales += data.totalPrice;
      }
    });

    res.json({ total_sales: totalSales, sale_month: month, sale_year: year });
  } catch (err) {
    logger.error("Analytics procedure 'getCompanyTotal' failed: %o", err);
    res.status(500).json({ error: "Analytics failed" });
  }
});

v1Router.get("/analytics/top-selling-products", async (req, res) => {
  try {
    const { limitCount = 5, year } = req.query;
    const productsSnap = await getDocs(collection(db, "products"));
    const productMap = {};
    productsSnap.docs.forEach(d => productMap[d.id] = d.data());

    const q = query(collection(db, "orderItems"), where("year", "==", Number(year)));
    const itemsSnap = await getDocs(q);
    
    const productStats = {};
    itemsSnap.docs.forEach(d => {
      const data = d.data();
      productStats[data.productId] = {
        quantity: (productStats[data.productId]?.quantity || 0) + data.quantity,
        sales: (productStats[data.productId]?.sales || 0) + (data.quantity * data.price)
      };
    });

    const result = Object.entries(productStats).map(([pid, stats]) => ({
      category: productMap[pid]?.category || "Unknown",
      name: productMap[pid]?.name || "Unknown",
      total_quantity_sold: stats.quantity,
      total_sales: stats.sales
    }))
    .sort((a, b) => b.total_sales - a.total_sales)
    .slice(0, Number(limitCount));

    res.json(result);
  } catch (err) {
    logger.error("Analytics procedure 'getTopSKUs' failed: %o", err);
    res.status(500).json({ error: "Analytics failed" });
  }
});

// Mount V1 Router
app.use("/api/v1", v1Router);

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Spring-Node Server initialized on Port ${PORT} (API v1)`);
  });
}

startServer();
