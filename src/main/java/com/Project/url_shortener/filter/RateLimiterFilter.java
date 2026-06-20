package com.Project.url_shortener.filter;

import com.Project.url_shortener.service.RateLimiterService;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import java.io.IOException;

@RequiredArgsConstructor
public class RateLimiterFilter implements Filter {
    private final RateLimiterService rateLimiterService;

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws ServletException, IOException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        String ip = httpRequest.getRemoteAddr();

        if(rateLimiterService.isAllowed(ip)){
            chain.doFilter(request,response); // asks further chains to do filtering and if no more chains then asks springboot to call the controller.
        }
        else{
            httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            httpResponse.getWriter().write("Too many requests. Please try again later.");
        }
    }
}

// TODO: Before deployment — change to getClientIp(httpRequest) to handle reverse proxy (X-Forwarded-For)
//String ip = httpRequest.getRemoteAddr();