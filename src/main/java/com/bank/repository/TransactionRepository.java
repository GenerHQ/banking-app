package com.bank.repository;

import com.bank.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountNumberOrderByCreatedAtDesc(String accountNumber);

    @Query("SELECT t FROM Transaction t WHERE t.accountNumber = :accountNumber ORDER BY t.createdAt DESC LIMIT 10")
    List<Transaction> findRecentTransactions(@Param("accountNumber") String accountNumber);
}