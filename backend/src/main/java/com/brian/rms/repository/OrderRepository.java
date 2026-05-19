/**
 * Written by Brian McCarthy
 */
package com.brian.rms.repository;

import com.brian.rms.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
}
