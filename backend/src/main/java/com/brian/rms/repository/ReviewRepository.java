/**
 * Written by Brian McCarthy
 */
package com.brian.rms.repository;

import com.brian.rms.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByProductId(Long productId);
}
