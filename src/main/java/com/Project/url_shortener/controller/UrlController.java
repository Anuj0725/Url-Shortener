package com.Project.url_shortener.controller;

import com.Project.url_shortener.dto.*;
import com.Project.url_shortener.model.Url;
import com.Project.url_shortener.model.User;
import com.Project.url_shortener.service.UrlService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequiredArgsConstructor
//@CrossOrigin
public class UrlController {
    private final UrlService service;
    @Value("${app.base-url}")
    private String baseUrl;

    @PostMapping("/api/shorten")
    public ResponseEntity<?> shortenUrl(@RequestBody UrlRequest req){
        Url url=service.shortenUrl(req.longUrl(),req.expiryDays());
        String shortenedLink=baseUrl + "/" + url.getShortCode();
        return new ResponseEntity<>(new UrlResponse(url.getLongUrl(),shortenedLink), HttpStatus.CREATED);
    }

    @GetMapping("/redirect/{shortCode}")
    public ResponseEntity<?> redirect(@PathVariable String shortCode){
        Optional<Url> Opt_url= service.getUrl(shortCode);

        if(Opt_url.isPresent()){
            Url url=Opt_url.get();
            LocalDateTime expiry=url.getExpiryTime();
            if(expiry!=null && LocalDateTime.now().isAfter(expiry)){
                return new ResponseEntity<>("This Link has been Expired",HttpStatus.BAD_REQUEST);
            }

            service.incrementClicksCount();
            service.incrementClicksCountPerUrl(url.getShortCode());
            String longUrl=url.getLongUrl();

            return new ResponseEntity<>(new RedirectResponse("You are being redirected to an external site",longUrl),HttpStatus.OK);

//            HttpHeaders headers = new HttpHeaders();
//            headers.setLocation(URI.create(longUrl));
//
//            return new ResponseEntity<>(headers,HttpStatus.FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/api/expand/{shortCode}")
    public ResponseEntity<String> OriginalUrl(@PathVariable String shortCode){
        Optional<Url> Opt_Url= service.getUrl(shortCode);
        if(Opt_Url.isEmpty())return new ResponseEntity<>("Url Not Found",HttpStatus.NOT_FOUND);

        return new ResponseEntity<>(Opt_Url.get().getLongUrl(),HttpStatus.OK);
    }

    @GetMapping("/api/stats/platform")
    public ResponseEntity<Analytics> getAnalytics(){
        return new ResponseEntity<>(service.AnalyticsStats(),HttpStatus.OK);
    }

    @PostMapping("/api/shorten/custom")
    public ResponseEntity<?> getCustomShortUrl(@RequestBody CustomUrlRequest req){
        Optional<Url> url=service.getCustomUrl(req.longUrl(), req.customAlias(), req.expiryDays());

        if(url.isEmpty()){
            return new ResponseEntity<>("Alias is already in use", HttpStatus.CONFLICT);
        }

        String shortenedLink=baseUrl + "/" + url.get().getShortCode();
        return new ResponseEntity<>(new UrlResponse(url.get().getLongUrl(),shortenedLink),HttpStatus.CREATED);
    }

    @GetMapping("/api/stats/{shortCode}")
    public ResponseEntity<?> getPerUrlAnalytics(@PathVariable String shortCode){
        Optional<Url> optUrl = service.getUrlForAnalytics(shortCode);
        if(optUrl.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        Url url=optUrl.get();

        if(url.getUser() != null){
            User user=service.getCurrentUser();
            if(user==null || !user.getId().equals(url.getUser().getId()))
                return new ResponseEntity<>("You are not authorized to view this",HttpStatus.FORBIDDEN);
        }

        String longUrl=url.getLongUrl();
        Long clicksCount=url.getClicksCount();
        LocalDateTime expiryTime=url.getExpiryTime();

        return new ResponseEntity<>(new PerUrlAnalytics(shortCode, longUrl,expiryTime, clicksCount), HttpStatus.OK);
    }

    @GetMapping("/my-links")
    public ResponseEntity<List<MyLinks>> getMyLinks(){
        List<MyLinks> myLinks=service.getMyLinks();
        return new ResponseEntity<>(myLinks,HttpStatus.OK);
    }

    @GetMapping("/{shortCode}")
    public ResponseEntity<?> redirectRoot(@PathVariable String shortCode){
        return redirect(shortCode);
    }
}