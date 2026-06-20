package com.Project.url_shortener.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UrlRequest(@JsonProperty("longUrl") String longUrl,@JsonProperty("expiryDays") Integer expiryDays) {
}
