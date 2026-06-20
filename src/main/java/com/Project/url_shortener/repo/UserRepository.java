package com.Project.url_shortener.repo;

import com.Project.url_shortener.model.Url;
import com.Project.url_shortener.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
