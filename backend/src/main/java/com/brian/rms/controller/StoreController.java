/**
 * Written by Brian McCarthy
 */
package com.brian.rms.controller;

import com.brian.rms.model.Store;
import com.brian.rms.repository.StoreRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stores")
@CrossOrigin(origins = "*")
public class StoreController {

    @Autowired
    private StoreRepository storeRepository;

    @GetMapping
    public List<Store> getAllStores() {
        return storeRepository.findAll();
    }

    @PostMapping
    public Store createStore(@Valid @RequestBody Store store) {
        return storeRepository.save(store);
    }
}
