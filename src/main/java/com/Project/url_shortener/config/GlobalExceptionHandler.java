package com.Project.url_shortener.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleBadRequest(IllegalArgumentException e){
        return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> handleConflict(IllegalStateException e){
        return new ResponseEntity<>(e.getMessage(),HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDuplicate(DataIntegrityViolationException e){
        return new ResponseEntity<>("A record with this data already exists.",HttpStatus.CONFLICT);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(AccessDeniedException e) {
        return new ResponseEntity<>("Access Denied", HttpStatus.FORBIDDEN);
    }
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<?> handleAuthError(AuthenticationException e) {
        return new ResponseEntity<>("Unauthorized", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleEveryOtherException(Exception e){
        e.printStackTrace();
        return new ResponseEntity<>("Something went wrong",HttpStatus.INTERNAL_SERVER_ERROR);
    }
}