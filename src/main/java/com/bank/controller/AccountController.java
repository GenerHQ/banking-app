package com.bank.controller;

import com.bank.model.Account;
import com.bank.model.Transaction;
import com.bank.service.AccountService;
import com.bank.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountController {
    private final AccountService accountService;
    private final TransactionService transactionService;

    // ============ ACCOUNT ENDPOINTS ============

    // GET all accounts - visit: http://localhost:8080/api/accounts
    @GetMapping("/accounts")
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    // GET a single account - visit: http://localhost:8080/api/account?accountNumber=ACC-0000000001
    @GetMapping("/account")
    public ResponseEntity<Account> getAccount(@RequestParam String accountNumber) {
        return ResponseEntity.ok(accountService.getAccount(accountNumber));
    }

    // POST create a new account - send JSON data
    @PostMapping("/accounts")
    public ResponseEntity<Account> createAccount(@RequestBody Map<String, Object> request) {
        String name = (String) request.get("name");
        double initialDeposit = Double.parseDouble(request.get("initialDeposit").toString());
        return ResponseEntity.ok(accountService.createAccount(name, initialDeposit));
    }

    // ============ TRANSACTION ENDPOINTS ============

    // POST deposit money
    @PostMapping("/deposit")
    public ResponseEntity<Transaction> deposit(@RequestBody Map<String, Object> request) {
        String accountNumber = (String) request.get("accountNumber");
        double amount = Double.parseDouble(request.get("amount").toString());
        return ResponseEntity.ok(transactionService.deposit(accountNumber, amount));
    }

    // POST withdraw money
    @PostMapping("/withdraw")
    public ResponseEntity<Transaction> withdraw(@RequestBody Map<String, Object> request) {
        String accountNumber = (String) request.get("accountNumber");
        double amount = Double.parseDouble(request.get("amount").toString());
        return ResponseEntity.ok(transactionService.withdraw(accountNumber, amount));
    }

    // POST transfer money between accounts
    @PostMapping("/transfer")
    public ResponseEntity<String> transfer(@RequestBody Map<String, Object> request) {
        String fromAccount = (String) request.get("fromAccount");
        String toAccount = (String) request.get("toAccount");
        double amount = Double.parseDouble(request.get("amount").toString());
        String remark = (String) request.getOrDefault("remark", "Transfer");

        transactionService.transfer(fromAccount, toAccount, amount, remark);

        return ResponseEntity.ok("Transfer completed successfully");
    }

    // GET transaction history
    @GetMapping("/transactions")
    public ResponseEntity<List<Transaction>> getTransactions(@RequestParam String accountNumber) {
        return ResponseEntity.ok(transactionService.getTransactionHistory(accountNumber));
    }

    // GET mini statement (last 10 transactions)
    @GetMapping("/mini-statement")
    public ResponseEntity<List<Transaction>> getMiniStatement(@RequestParam String accountNumber) {
        return ResponseEntity.ok(transactionService.getMiniStatement(accountNumber));
    }
}