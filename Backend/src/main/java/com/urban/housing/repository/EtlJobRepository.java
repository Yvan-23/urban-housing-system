package com.urban.housing.repository;

import com.urban.housing.entity.EtlJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface EtlJobRepository extends JpaRepository<EtlJob, UUID> {
}
