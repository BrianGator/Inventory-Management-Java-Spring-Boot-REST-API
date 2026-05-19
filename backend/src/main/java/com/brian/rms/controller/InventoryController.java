/**
 * Written by Brian McCarthy
 */
package com.brian.rms.controller;

import com.brian.rms.model.Inventory;
import com.brian.rms.repository.InventoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    @Autowired
    private InventoryRepository inventoryRepository;

    @GetMapping("/{storeId}")
    public List<Inventory> getStoreInventory(@PathVariable Long storeId) {
        return inventoryRepository.findByStoreId(storeId);
    }

    @PostMapping
    public Inventory updateStock(@RequestBody Inventory request) {
        return inventoryRepository.findByProductIdAndStoreId(request.getProductId(), request.getStoreId())
                .map(existing -> {
                    existing.setStockLevel(existing.getStockLevel() + request.getStockLevel());
                    return inventoryRepository.save(existing);
                })
                .orElseGet(() -> inventoryRepository.save(request));
    }
}
