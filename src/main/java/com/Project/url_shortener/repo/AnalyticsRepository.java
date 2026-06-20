package com.Project.url_shortener.repo;

import com.Project.url_shortener.model.Analytics;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics,Integer> {
    @Modifying
    @Transactional
    @Query("UPDATE Analytics a SET a.clicksCount=a.clicksCount+1")
    void incrementClicksCount();

    @Modifying
    @Transactional
    @Query("UPDATE Analytics a SET a.linksCreated=a.linksCreated+1")
    void incrementNewLinksCreated();

    @Modifying
    @Transactional
    @Query("UPDATE Url u SET u.clicksCount=u.clicksCount+1 WHERE u.shortCode= :shortCode")
    void incrementClicksCountPerUrl(@Param("shortCode") String shortCode);
}