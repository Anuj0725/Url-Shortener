package com.Project.url_shortener.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "url", indexes = {
        @Index(name = "longUrl_idx", columnList = "longUrl"),
        @Index(name = "shortUrl_idx", columnList = "shortCode", unique = true)
})
public class Url implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 700, nullable = false)
    private String longUrl;

    @Column(unique = true,nullable = false, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String shortCode;
    //COLLATE utf8mb4_bin is used to make String case-sensitive as MySql is case-insensitive

    private LocalDateTime created_at;
    private LocalDateTime expiryTime;

    public Url(String longUrl, String shortCode, LocalDateTime expiryTime) {
        this.longUrl=longUrl;
        this.shortCode=shortCode;
        this.expiryTime=expiryTime;
    }

    @PrePersist
    protected void onCreate() {
        this.created_at = LocalDateTime.now();
    }

    private Long clicksCount=0L;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;
}