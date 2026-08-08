package com.example.demo.dto;

public class OtpChallengeResponse {
    private String challengeId;
    private String maskedEmail;
    private long expiresInSeconds;
    private String operation;
    private String message;

    public String getChallengeId() { return challengeId; }
    public void setChallengeId(String challengeId) { this.challengeId = challengeId; }
    public String getMaskedEmail() { return maskedEmail; }
    public void setMaskedEmail(String maskedEmail) { this.maskedEmail = maskedEmail; }
    public long getExpiresInSeconds() { return expiresInSeconds; }
    public void setExpiresInSeconds(long expiresInSeconds) { this.expiresInSeconds = expiresInSeconds; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
