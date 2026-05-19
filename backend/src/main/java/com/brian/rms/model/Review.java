/**
 * Written by Brian McCarthy
 */
package com.brian.rms.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    private String id;
    private String customerId;
    private Long productId;
    private Long storeId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt = LocalDateTime.now();
}
