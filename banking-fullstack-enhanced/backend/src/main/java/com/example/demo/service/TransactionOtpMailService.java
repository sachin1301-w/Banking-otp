package com.example.demo.service;

import com.example.demo.exception.EmailDeliveryException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

@Service
public class TransactionOtpMailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    @Value("${spring.mail.sender-name:Banking System}")
    private String senderName;

    public TransactionOtpMailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendOtp(
            String toEmail,
            String customerName,
            String otp,
            String operation,
            Double amount,
            String sourceAccount,
            String targetAccount,
            int expiryMinutes
    ) {

        String prettyOperation = switch (operation) {
            case "DEPOSIT" -> "deposit";
            case "WITHDRAW" -> "withdrawal";
            case "TRANSFER" -> "transfer";
            default -> "transaction";
        };

        NumberFormat inr =
                NumberFormat.getCurrencyInstance(
                        new Locale("en", "IN")
                );

        String customer =
                customerName == null || customerName.isBlank()
                        ? "Customer"
                        : customerName;

        StringBuilder body = new StringBuilder();

        body.append("Hello ")
                .append(customer)
                .append(",\n\n")
                .append("We received a request to confirm a ")
                .append(prettyOperation)
                .append(" on your Banking System account.\n\n")
                .append("OTP: ")
                .append(otp)
                .append("\n")
                .append("Amount: ")
                .append(inr.format(amount))
                .append("\n")
                .append("Account: ")
                .append(maskAccount(sourceAccount))
                .append("\n");

        if (targetAccount != null && !targetAccount.isBlank()) {
            body.append("Recipient: ")
                    .append(maskAccount(targetAccount))
                    .append("\n");
        }

        body.append("\nThis OTP expires in ")
                .append(expiryMinutes)
                .append(" minutes and can be used only once.\n")
                .append("If you did not request this transaction, ")
                .append("do not share this OTP with anyone.\n\n")
                .append(senderName);

        try {

            SimpleMailMessage message = new SimpleMailMessage();

            message.setFrom(senderEmail);
            message.setTo(toEmail);

            message.setSubject(
                    "Confirm your Banking System " + prettyOperation
            );

            message.setText(body.toString());

            mailSender.send(message);

            System.out.println(
                    "Gmail OTP sent successfully to: " + toEmail
            );

        } catch (Exception ex) {

            System.err.println(
                    "========== GMAIL SMTP ERROR =========="
            );

            System.err.println(
                    "Error: " + ex.getMessage()
            );

            System.err.println(
                    "======================================="
            );

            throw new EmailDeliveryException(
                    "Could not send OTP using Gmail SMTP.",
                    ex
            );
        }
    }

    private String maskAccount(String accountNumber) {

        if (accountNumber == null || accountNumber.length() <= 4) {
            return "****";
        }

        return "****"
                + accountNumber.substring(
                accountNumber.length() - 4
        );
    }
}