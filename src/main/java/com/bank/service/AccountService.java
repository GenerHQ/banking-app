package com.bank.service;

import com.bank.model.Account;
import com.bank.repository.AccountRepository;
import com.bank.exception.AccountNotFoundException;  // ← Add this import
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;

    @Transactional
    public Account createAccount(String name, double initialDeposit) {
        // VALIDATE: Account name cannot be blank
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Account name is required");
        }

        // VALIDATE: Initial deposit cannot be negative
        if (initialDeposit < 0) {
            throw new IllegalArgumentException("Initial deposit cannot be negative");
        }

        Account account = new Account();
        account.setAccountName(name.trim());
        account.setBalance(initialDeposit);
        account.setAccountNumber(generateAccountNumber());

        return accountRepository.save(account);
    }

    public Account getAccount(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new AccountNotFoundException(accountNumber));
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

    @Transactional
    public void updateBalance(String accountNumber, double newBalance) {
        Account account = getAccount(accountNumber);
        account.setBalance(newBalance);
        accountRepository.save(account);
    }

    private String generateAccountNumber() {
        long count = accountRepository.count() + 1;
        return String.format("ACC-%010d", count);
    }
}