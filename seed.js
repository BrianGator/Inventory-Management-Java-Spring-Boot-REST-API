import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));

const app = initializeApp(firebaseConfig);
const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

async function seed() {
  console.log("Seeding data...");

  // 1. Stores
  const store1 = await addDoc(collection(db, "stores"), { name: "Downtown NYC", address: "123 Broadway, NY" });
  const store2 = await addDoc(collection(db, "stores"), { name: "SF Hub", address: "456 Market St, SF" });
  console.log("Stores seeded");

  // 2. Products
  const p1 = await addDoc(collection(db, "products"), { name: "MacBook Pro", category: "Electronics", price: 1999.99, sku: "MBP-2024" });
  const p2 = await addDoc(collection(db, "products"), { name: "iPhone 15", category: "Mobile", price: 999.99, sku: "IP15-64" });
  const p3 = await addDoc(collection(db, "products"), { name: "Ergonomic Chair", category: "Furniture", price: 299.50, sku: "CH-ERG-01" });
  console.log("Products seeded");

  // 3. Inventory
  await addDoc(collection(db, "inventory"), { productId: p1.id, storeId: store1.id, stockLevel: 25 });
  await addDoc(collection(db, "inventory"), { productId: p2.id, storeId: store1.id, stockLevel: 50 });
  await addDoc(collection(db, "inventory"), { productId: p3.id, storeId: store1.id, stockLevel: 10 });
  await addDoc(collection(db, "inventory"), { productId: p1.id, storeId: store2.id, stockLevel: 15 });
  console.log("Inventory seeded");

  // 4. Sample Orders for analytics
  const c1 = await addDoc(collection(db, "customers"), { name: "John Doe", email: "john@example.com", phone: "555-0101" });
  
  const o1 = await addDoc(collection(db, "orders"), {
    customerId: c1.id,
    storeId: store1.id,
    totalPrice: 2299.49,
    date: Timestamp.fromDate(new Date(2025, 2, 15)), // March 15, 2025
    status: "completed"
  });

  await addDoc(collection(db, "orderItems"), { orderId: o1.id, productId: p1.id, quantity: 1, price: 1999.99 });
  await addDoc(collection(db, "orderItems"), { orderId: o1.id, productId: p3.id, quantity: 1, price: 299.50 });

  console.log("Seeding complete!");
  process.exit(0);
}

seed();
