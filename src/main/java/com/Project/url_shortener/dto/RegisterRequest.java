package com.Project.url_shortener.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record RegisterRequest(@JsonProperty("email") String email,@JsonProperty("password") String password) {
}
