package com.Project.url_shortener.config;

import com.Project.url_shortener.filter.RateLimiterFilter;
import com.Project.url_shortener.service.RateLimiterService;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FilterConfig {
    @Bean
    public FilterRegistrationBean<RateLimiterFilter> rateLimitingFilter(RateLimiterService rateLimiterService) {
        FilterRegistrationBean<RateLimiterFilter> bean = new FilterRegistrationBean<>();
        RateLimiterFilter checker = new RateLimiterFilter(rateLimiterService);
        bean.setFilter(checker);
        bean.addUrlPatterns("/*");
        bean.setOrder(1);
        return bean;
    }
}