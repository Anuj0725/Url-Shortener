package com.Project.url_shortener.dto;

import java.time.LocalDateTime;

public record MyLinks(String longUrl, String shortCode, LocalDateTime expiryTime, Long clicksCount) {
}
