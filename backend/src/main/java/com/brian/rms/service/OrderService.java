/**
 * Written by Brian McCarthy
 */
package com.brian.rms.service;

import com.brian.rms.model.*;
import com.brian.rms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private CustomerRepository customerRepository;
    @Autowired
    private InventoryRepository inventoryRepository;

    @Transactional
    public Order placeOrder(Customer customer, Long storeId, List<OrderItem> items, Double totalPrice) {
        // 1. Manage Customer
        Customer savedCustomer = customerRepository.findByEmail(customer.getEmail())
                .orElseGet(() -> customerRepository.save(customer));

        // 2. Create Order
        Order order = new Order();
        order.setCustomerId(savedCustomer.getId());
        order.setStoreId(storeId);
        order.setTotalPrice(totalPrice);
        Order savedOrder = orderRepository.save(order);

        // 3. Process Items and Inventory
        for (OrderItem item : items) {
            item.setOrderId(savedOrder.getId());
            orderItemRepository.save(item);

            inventoryRepository.findByProductIdAndStoreId(item.getProductId(), storeId)
                    .ifPresent(inv -> {
                        inv.setStockLevel(inv.getStockLevel() - item.getQuantity());
                        inventoryRepository.save(inv);
                    });
        }

        return savedOrder;
    }
}
