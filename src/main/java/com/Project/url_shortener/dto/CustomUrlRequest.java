package com.Project.url_shortener.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record CustomUrlRequest(@JsonProperty("longUrl") String longUrl,@JsonProperty("customAlias") String customAlias,@JsonProperty("expiryDays") Integer expiryDays) {
}
