package com.bank.controller;

import com.bank.model.Account;
import com.bank.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ViewController {

    private final AccountService accountService;

    @GetMapping("/")
    public String index(Model model) {
        List<Account> accounts = accountService.getAllAccounts();
        model.addAttribute("accounts", accounts);

        // Calculate statistics
        double totalBalance = accounts.stream()
                .mapToDouble(Account::getBalance)
                .sum();
        model.addAttribute("totalBalance", totalBalance);
        model.addAttribute("totalAccounts", accounts.size());

        return "index";
    }
}