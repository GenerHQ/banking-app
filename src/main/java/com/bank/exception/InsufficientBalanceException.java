package com.bank.exception;

public class InsufficientBalanceException extends RuntimeException {
    private final String accountNumber;
    private final double availableBalance;
    private final double requestedAmount;

    public InsufficientBalanceException(String accountNumber, double availableBalance, double requestedAmount) {
        super(String.format("Insufficient balance. Account: %s, Available: %.2f, Requested: %.2f",
                accountNumber, availableBalance, requestedAmount));
        this.accountNumber = accountNumber;
        this.availableBalance = availableBalance;
        this.requestedAmount = requestedAmount;
    }

    public String getAccountNumber() { return accountNumber; }
    public double getAvailableBalance() { return availableBalance; }
    public double getRequestedAmount() { return requestedAmount; }
}