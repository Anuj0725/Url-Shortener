package com.Project.url_shortener.controller;

import com.Project.url_shortener.dto.AuthResponse;
import com.Project.url_shortener.dto.LoginRequest;
import com.Project.url_shortener.dto.RegisterRequest;
import com.Project.url_shortener.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
//@CrossOrigin
public class AuthController {
    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request){
        AuthResponse response=authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request){
        AuthResponse response=authService.login(request);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}