/**
 * Written by Brian McCarthy
 */
package com.brian.rms.repository;

import com.brian.rms.model.Store;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
}
