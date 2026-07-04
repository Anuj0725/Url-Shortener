package com.Project.url_shortener.service;

import com.Project.url_shortener.dto.Analytics;
import com.Project.url_shortener.dto.MyLinks;
import com.Project.url_shortener.model.Url;
import com.Project.url_shortener.model.User;
import com.Project.url_shortener.repo.AnalyticsRepository;
import com.Project.url_shortener.repo.UrlRepository;
import com.Project.url_shortener.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class UrlService {
    private final UrlRepository urlRepo;
    private final AnalyticsRepository analyticsRepo;
    private final UserRepository userRepo;
    @Value("${app.base-url}")
    private String baseUrl;

    @Cacheable(value="urls", key="#shortCode", unless = "#result == null")
    public Optional<Url> getUrl(String shortCode){
        return urlRepo.findByShortCode(shortCode);
    }

    @Transactional
    public Url shortenUrl(String longUrl, Integer Expiry) {
        validateUrl(longUrl);
        LocalDateTime expiryTime=getExpiryTime(Expiry);

        incrementNewLinksCreated();
        Url url=new Url(longUrl,"Random-;ocbucb4t8cukcbdnxgouvjvse5rcnaczk.n", expiryTime);
        url.setUser(getCurrentUser());
        url= urlRepo.save(url);
        String shortCode=base62(url.getId());
        url.setShortCode(shortCode);
        return urlRepo.save(url);
    }

    @Transactional
    public Optional<Url> getCustomUrl(String longUrl, String customAlias, Integer Expiry) {
        validateUrl(longUrl);
        validateAlias(customAlias);

        if(urlRepo.findByShortCode(customAlias).isPresent()){
            return Optional.empty();
        }
        LocalDateTime expiryTime=getExpiryTime(Expiry);

        incrementNewLinksCreated();
        Url newUrl=new Url(longUrl,customAlias,expiryTime);
        newUrl.setUser(getCurrentUser());
        return Optional.of(urlRepo.save(newUrl));
    }

    private static final Pattern pattern_alias=Pattern.compile("^[a-zA-Z0-9_-]{3,50}$");
    private static final List<String> reserved = List.of("api", "redirect", "my-links", "admin", "static", "health");

    private void validateAlias(String alias) {
        if(alias==null || alias.isBlank()){
            throw new IllegalArgumentException("Custom Alias cannot be empty if opted for then.");
        }
        if(!pattern_alias.matcher(alias).matches()){
            throw new IllegalArgumentException("Alias must be 3-50 characters, alphanumeric, hyphen or underscores only");
        }

        String lowerAlias=alias.toLowerCase();
        for(String word : reserved){
            if(lowerAlias.startsWith(word)){
                throw new IllegalArgumentException("This Alias is reserved, Please try another Alias");
            }
        }
    }

    private static final Pattern pattern_url= Pattern.compile("^(https?://)[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(:\\d{1,5})?(/.*)?$");

    private void validateUrl(String url) throws IllegalArgumentException{
        if(url==null || !pattern_url.matcher(url).matches()){
            throw new IllegalArgumentException("It is an Invalid Url. It must be a http:// or https:// link");
        }
    }

    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if(auth!=null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)){
            String email = auth.getName();
            return userRepo.findByEmail(email).orElse(null);
        }

        return null;
    }

    private LocalDateTime getExpiryTime(Integer Expiry){
        if(Expiry==null) {
            return LocalDateTime.now().plusDays(30);
        }
        else if(Expiry<1){
            throw new IllegalArgumentException("Expiry must be atleast 1 day");
        }
        else {
            if(Expiry>365)Expiry=365;
            return LocalDateTime.now().plusDays(Expiry);
        }
    }

    private static final String alphanum="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private String base62(Long id) {
        if(id==0)return String.valueOf(alphanum.charAt(0));

        long divisor= 62L;
        StringBuilder sb=new StringBuilder();
        while(id>0){
            int rem=(int)(id % divisor);
            sb.append(alphanum.charAt(rem));
            id/=divisor;
        }

        return sb.reverse().toString();
    }

    @Transactional
    public void incrementClicksCount(){
        analyticsRepo.incrementClicksCount();
    }

    @Transactional
    public void incrementNewLinksCreated(){
        analyticsRepo.incrementNewLinksCreated();
    }

    public Analytics AnalyticsStats() {
        Optional<com.Project.url_shortener.model.Analytics> stats=analyticsRepo.findById(1);

        if(stats.isPresent())return new Analytics(stats.get().getClicksCount(),stats.get().getLinksCreated());

        return new Analytics(null,null);
    }

    @Transactional
    public void incrementClicksCountPerUrl(String shortCode) {
        analyticsRepo.incrementClicksCountPerUrl(shortCode);
    }

    public Optional<Url> getUrlForAnalytics(String shortCode) {
        return urlRepo.findByShortCode(shortCode);
    }

    @Transactional
    @Scheduled(cron = "0 0 2 * * *")
    @CacheEvict(value = "urls", allEntries = true)
    public void cleanUp(){
        urlRepo.deleteExpired(LocalDateTime.now());
    }

    public List<MyLinks> getMyLinks(){
        User user=getCurrentUser();
        if(user==null){
            throw new IllegalStateException("Not authenticated");
        }

        List<Url> urls=urlRepo.findByUser(user);
        List<MyLinks> result=new ArrayList<>();
        for(Url url : urls){
            MyLinks link=new MyLinks(url.getLongUrl(), baseUrl + "/redirect/" + url.getShortCode(),url.getExpiryTime(),url.getClicksCount());
            result.add(link);
        }

        return result;
    }
}