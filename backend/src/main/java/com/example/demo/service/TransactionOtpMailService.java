package com.example.demo.service;

import com.example.demo.exception.EmailDeliveryException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class TransactionOtpMailService {

    private final RestClient restClient;

    @Value("${resend.api-key:}")
    private String apiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String senderEmail;

    @Value("${resend.from-name:Banking System}")
    private String senderName;


    public TransactionOtpMailService() {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.resend.com")
                .build();
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

        if (apiKey == null || apiKey.isBlank()) {
            throw new EmailDeliveryException(
                    "Resend email is not configured. Set RESEND_API_KEY in the backend environment.",
                    null
            );
        }


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


        StringBuilder body =
                new StringBuilder();

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


        if (targetAccount != null &&
                !targetAccount.isBlank()) {

            body.append("Recipient: ")
                    .append(maskAccount(targetAccount))
                    .append("\n");
        }


        body.append("\nThis OTP expires in ")
                .append(expiryMinutes)
                .append(" minutes and can be used only once.\n")

                .append(
                        "If you did not request this transaction, " +
                                "do not share the OTP and do not approve the transaction.\n\n"
                )

                .append(senderName);


        Map<String, Object> requestBody =
                Map.of(

                        "from",
                        senderName +
                                " <" +
                                senderEmail +
                                ">",

                        "to",
                        List.of(toEmail),

                        "subject",
                        "Confirm your Banking System "
                                + prettyOperation,

                        "text",
                        body.toString()
                );


        try {

            restClient
                    .post()
                    .uri("/emails")

                    .header(
                            HttpHeaders.AUTHORIZATION,
                            "Bearer " + apiKey
                    )

                    .contentType(
                            MediaType.APPLICATION_JSON
                    )

                    .body(requestBody)

                    .retrieve()

                    .toBodilessEntity();


            System.out.println(
                    "OTP email successfully sent to "
                            + toEmail
            );


        } catch (RestClientResponseException ex) {

            System.err.println(
                    "========== RESEND API ERROR =========="
            );

            System.err.println(
                    "HTTP Status : "
                            + ex.getStatusCode()
            );

            System.err.println(
                    "Response : "
                            + ex.getResponseBodyAsString()
            );

            System.err.println(
                    "======================================"
            );


            throw new EmailDeliveryException(

                    "OTP email failed: "
                            + ex.getResponseBodyAsString(),

                    ex
            );


        } catch (RestClientException ex) {

            System.err.println(
                    "Resend connection error: "
                            + ex.getMessage()
            );


            throw new EmailDeliveryException(

                    "Could not connect to Resend email service.",

                    ex
            );
        }
    }


    private String maskAccount(
            String accountNumber
    ) {

        if (accountNumber == null ||
                accountNumber.length() <= 4) {

            return "****";
        }


        return "****" +
                accountNumber.substring(
                        accountNumber.length() - 4
                );
    }
}