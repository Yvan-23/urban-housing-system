package com.urban.housing.repository;

import com.urban.housing.entity.HousingData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface HousingDataRepository extends JpaRepository<HousingData, UUID> {
    List<HousingData> findByDistrict(String district);
}
