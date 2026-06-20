package com.Project.url_shortener.repo;

import com.Project.url_shortener.model.Url;
import com.Project.url_shortener.model.User;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UrlRepository extends JpaRepository<Url,Long> {//<return type, Primary key dataType>
    Optional<Url> findByShortCode(String shortCode);

    Optional<Url> findByLongUrl(String longUrl);

    @Modifying
    @Query("DELETE FROM Url u WHERE u.expiryTime< :now")
    void deleteExpired(@Param("now")LocalDateTime now);

    List<Url> findByUser(User user);
}
