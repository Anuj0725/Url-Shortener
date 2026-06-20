package com.Project.url_shortener.dto;

import java.time.LocalDateTime;

public record PerUrlAnalytics(String shortCode, String longUrl, LocalDateTime expiryTime, Long clicksCount) {
}
