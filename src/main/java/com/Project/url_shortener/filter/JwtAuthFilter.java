package com.Project.url_shortener.filter;

import com.Project.url_shortener.repo.UserRepository;
import com.Project.url_shortener.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepo;

    @Override
    protected void doFilterInternal(HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        final String header=request.getHeader("Authorization");
        final String token, email;

        if(header==null || !header.startsWith("Bearer ")){
            filterChain.doFilter(request,response);
            return;
        }

        token=header.substring(7);
        //It is like => Bearer onvoiwnfovakrbuszfhxbgymvbfkjnsvazjfxbg
        email=jwtService.extractEmail(token);

        if(email!=null && SecurityContextHolder.getContext().getAuthentication()==null){
            UserDetails details=this.userRepo.findByEmail(email).orElse(null);

            if(details!=null && jwtService.isTokenValid(token)){
                UsernamePasswordAuthenticationToken authToken=new
                        UsernamePasswordAuthenticationToken(details,null,details.getAuthorities());

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request,response);
    }
}
