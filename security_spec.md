# Security Specification for Retail Management System

## Data Invariants
1. Orders must have a valid customerId and storeId.
2. Order price must match the sum of orderItems price * quantity.
3. Inventory records are unique per (productId, storeId) pair.
4. Only authorized admin users (for this lab, we'll allow all authenticated users for ease of use, but with owner/verified rules for production) can modify core data.

## The "Dirty Dozen" Payloads
1. Create a store with an empty name.
2. Create a product with a negative price.
3. Update someone else's order status.
4. Set inventory stockLevel to a non-integer.
5. Create a review for a non-existent product.
6. Delete a store that still has active inventory.
7. Inject a 1MB string into a product SKU.
8. Create a customer without a valid email format.
9. Bypass stock validation to order items that aren't in stock.
10. Spoof `createdAt` to a past date.
11. Read pii of other customers if they weren't the ones who placed the order.
12. Modify analytics snapshots manually (if we had them).

## Test Runner (Logic Summary)
- `isValidStore(data)`: checks name, address strings.
- `isValidProduct(data)`: checks name, cat, price > 0, sku unique-ish.
- `isValidInventory(data)`: checks pid, sid, stockLevel >= 0.
- `isValidOrder(data)`: checks total > 0, date == server time.
