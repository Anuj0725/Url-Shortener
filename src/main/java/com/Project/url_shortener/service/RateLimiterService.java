package com.Project.url_shortener.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimiterService {
    private final StringRedisTemplate redisTemplate;

    public boolean isAllowed(String ip){
        String key="rate_limit:"+ip;

        Long count = redisTemplate.opsForValue().increment(key);

        if(count!=null && count==1){
            redisTemplate.expire(key, Duration.ofSeconds(60));
        }
        else if(count!=null && count>15){
            return false;
        }

        return true;
    }
}

