package com.urban.housing.repository;

import com.urban.housing.entity.Kpi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface KpiRepository extends JpaRepository<Kpi, UUID> {
}
