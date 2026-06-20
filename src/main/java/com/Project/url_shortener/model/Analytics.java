package com.Project.url_shortener.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Analytics {
    @Id
    private Integer id=1;

    private Long clicksCount=0L;
    private Long linksCreated=0L;
}
