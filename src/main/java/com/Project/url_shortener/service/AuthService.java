package com.Project.url_shortener.service;

import com.Project.url_shortener.dto.AuthResponse;
import com.Project.url_shortener.dto.LoginRequest;
import com.Project.url_shortener.dto.RegisterRequest;
import com.Project.url_shortener.model.User;
import com.Project.url_shortener.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request){
        if(userRepo.findByEmail(request.email()).isPresent()){
            throw new IllegalStateException("An account with this email id already exists.");
        }

        User user=new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));

        userRepo.save(user);
        String token=jwtService.generateToken(user.getEmail());

        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        User user=userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token=jwtService.generateToken((user.getEmail()));

        return new AuthResponse(token);
    }
}