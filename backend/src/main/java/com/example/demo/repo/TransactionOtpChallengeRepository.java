package com.example.demo.repo;

import com.example.demo.entity.TransactionOtpChallenge;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TransactionOtpChallengeRepository extends JpaRepository<TransactionOtpChallenge, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from TransactionOtpChallenge o where o.id = :id")
    Optional<TransactionOtpChallenge> findByIdForUpdate(@Param("id") String id);

    Optional<TransactionOtpChallenge> findTopByUserEmailAndConsumedFalseOrderByCreatedAtDesc(String userEmail);
}
