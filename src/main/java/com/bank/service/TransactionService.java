package com.bank.service;

import com.bank.model.Account;
import com.bank.model.Transaction;
import com.bank.model.TransactionType;
import com.bank.repository.TransactionRepository;
import com.bank.exception.AccountNotFoundException;  // ← Add this import
import com.bank.exception.InsufficientBalanceException;  // ← Add this
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    @Transactional
    public Transaction deposit(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        Account account = accountService.getAccount(accountNumber);
        double newBalance = account.getBalance() + amount;
        accountService.updateBalance(accountNumber, newBalance);

        return saveTransaction(accountNumber, TransactionType.DEPOSIT, amount, newBalance, "Deposit");
    }

    @Transactional
    public Transaction withdraw(String accountNumber, double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        Account account = accountService.getAccount(accountNumber);
        if (account.getBalance() < amount) {
            throw new InsufficientBalanceException(accountNumber, account.getBalance(), amount);
        }

        double newBalance = account.getBalance() - amount;
        accountService.updateBalance(accountNumber, newBalance);

        return saveTransaction(accountNumber, TransactionType.WITHDRAW, amount, newBalance, "Withdrawal");
    }

    @Transactional
    public void transfer(String fromAccount, String toAccount, double amount, String remark) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }

        Account from = accountService.getAccount(fromAccount);
        Account to = accountService.getAccount(toAccount);

        if (from.getBalance() < amount) {
            throw new InsufficientBalanceException(fromAccount, from.getBalance(), amount);
        }

        // Update balances
        double fromNewBalance = from.getBalance() - amount;
        double toNewBalance = to.getBalance() + amount;

        accountService.updateBalance(fromAccount, fromNewBalance);
        accountService.updateBalance(toAccount, toNewBalance);

        // Save transactions
        saveTransaction(fromAccount, TransactionType.TRANSFER_OUT, amount, fromNewBalance,
                "Transfer to " + toAccount + " (" + remark + ")");
        saveTransaction(toAccount, TransactionType.TRANSFER_IN, amount, toNewBalance,
                "Transfer from " + fromAccount + " (" + remark + ")");
    }

    public List<Transaction> getTransactionHistory(String accountNumber) {
        accountService.getAccount(accountNumber);
        return transactionRepository.findByAccountNumberOrderByCreatedAtDesc(accountNumber);
    }

    public List<Transaction> getMiniStatement(String accountNumber) {
        accountService.getAccount(accountNumber);
        return transactionRepository.findRecentTransactions(accountNumber);
    }

    private Transaction saveTransaction(String accountNumber, TransactionType type,
                                        double amount, double balanceAfter, String remark) {
        Transaction transaction = new Transaction();
        transaction.setAccountNumber(accountNumber);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setRemarks(remark);
        return transactionRepository.save(transaction);
    }
}