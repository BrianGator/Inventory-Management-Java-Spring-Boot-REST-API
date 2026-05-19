/**
 * Written by Brian McCarthy
 */
package com.brian.rms.repository;

import com.brian.rms.model.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    List<Inventory> findByStoreId(Long storeId);
    Optional<Inventory> findByProductIdAndStoreId(Long productId, Long storeId);
}
