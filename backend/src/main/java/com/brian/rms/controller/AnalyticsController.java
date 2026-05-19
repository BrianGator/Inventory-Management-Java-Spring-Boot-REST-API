/**
 * Written by Brian McCarthy
 */
package com.brian.rms.controller;

import com.brian.rms.model.Order;
import com.brian.rms.model.OrderItem;
import com.brian.rms.repository.OrderItemRepository;
import com.brian.rms.repository.OrderRepository;
import com.brian.rms.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsController {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/monthly-sales-by-store")
    public List<Map<String, Object>> getMonthlySales(@RequestParam Integer year, @RequestParam Integer month) {
        // Simulating the Backend SQL Stored Procedure behavior
        List<Order> allOrders = orderRepository.findAll();
        Map<Long, Double> salesMap = new HashMap<>();

        for (Order order : allOrders) {
            if (order.getDate().getYear() == year && order.getDate().getMonthValue() == month) {
                salesMap.put(order.getStoreId(), salesMap.getOrDefault(order.getStoreId(), 0.0) + order.getTotalPrice());
            }
        }

        return salesMap.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("store_id", entry.getKey());
            map.put("total_sales", entry.getValue());
            return map;
        }).collect(Collectors.toList());
    }

    @GetMapping("/total-company-sales")
    public Map<String, Object> getTotalSales(@RequestParam Integer year, @RequestParam Integer month) {
        List<Order> allOrders = orderRepository.findAll();
        double total = allOrders.stream()
                .filter(o -> o.getDate().getYear() == year && o.getDate().getMonthValue() == month)
                .mapToDouble(Order::getTotalPrice)
                .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("total_sales", total);
        response.put("sale_month", month);
        response.put("sale_year", year);
        return response;
    }
}
