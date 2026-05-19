/**
 * Written by Brian McCarthy
 */
package com.brian.rms.controller;

import com.brian.rms.model.Order;
import com.brian.rms.model.OrderItem;
import com.brian.rms.model.Customer;
import com.brian.rms.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public Order placeOrder(@RequestBody Map<String, Object> payload) {
        // Simple mapping from generic map to strongly typed objects
        Map<String, String> custMap = (Map<String, String>) payload.get("customer");
        Customer customer = new Customer();
        customer.setName(custMap.get("name"));
        customer.setEmail(custMap.get("email"));
        customer.setPhone(custMap.get("phone"));

        Long storeId = Long.valueOf(payload.get("storeId").toString());
        Double total = Double.valueOf(payload.get("totalPrice").toString());
        List<Map<String, Object>> itemMaps = (List<Map<String, Object>>) payload.get("items");
        
        List<OrderItem> items = itemMaps.stream().map(m -> {
            OrderItem item = new OrderItem();
            item.setProductId(Long.valueOf(m.get("productId").toString()));
            item.setQuantity(Integer.valueOf(m.get("quantity").toString()));
            item.setPrice(Double.valueOf(m.get("price").toString()));
            item.setYear(2025); // Simplified
            item.setMonth(3);   // Simplified
            return item;
        }).toList();

        return orderService.placeOrder(customer, storeId, items, total);
    }
}
