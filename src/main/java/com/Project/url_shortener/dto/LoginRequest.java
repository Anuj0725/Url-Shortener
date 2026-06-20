package com.Project.url_shortener.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record LoginRequest(@JsonProperty("email") String email,@JsonProperty("password") String password) {
}
