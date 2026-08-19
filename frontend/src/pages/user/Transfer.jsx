import { useEffect, useState } from "react";
import { useMyAccount } from "../../hooks/useMyAccount";
import { transactionsApi } from "../../api/services";
import MoneyOperationCard from "../../components/MoneyOperationCard";
import OtpVerificationModal from "../../components/OtpVerificationModal";

const errorMessage = (err, fallback) => err.response?.data?.message || err.message || fallback;

export default function Transfer() {
  const { accounts, loading, reload } = useMyAccount();
  const [selected, setSelected] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState({ state: "idle", message: "" });
  const [challenge, setChallenge] = useState(null);
  const [otpError, setOtpError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (accounts[0] && !selected) setSelected(accounts[0].accountNumber);
  }, [accounts, selected]);

  const requestOtp = async (payload, isResend = false) => {
    isResend ? setResending(true) : setStatus({ state: "pending", message: "Sending OTP to your email…" });
    setOtpError("");
    try {
      const response = await transactionsApi.requestTransferOtp(payload);
      setChallenge({ ...response, payload });
      setStatus({ state: "success", message: response.message || "OTP sent. Verify it to complete the transfer." });
    } catch (err) {
      const message = errorMessage(err, "Could not send OTP.");
      if (isResend) setOtpError(message);
      else setStatus({ state: "error", message });
    } finally {
      setResending(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const toAccountNumber = recipient.trim();
    if (selected === toAccountNumber) {
      setStatus({ state: "error", message: "Source and recipient accounts must be different." });
      return;
    }
    await requestOtp({
      fromAccountNumber: selected,
      toAccountNumber,
      amount: Number(amount),
    });
  };

  const verify = async (otp) => {
    setVerifying(true);
    setOtpError("");
    try {
      const tx = await transactionsApi.verifyOtp({ challengeId: challenge.challengeId, otp });
      setChallenge(null);
      setStatus({ state: "success", message: `Transfer successful. Reference: ${tx.referenceId || tx.id}` });
      setAmount("");
      setRecipient("");
      await reload();
    } catch (err) {
      setOtpError(errorMessage(err, "OTP verification failed."));
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading accounts…</p>;
  if (!accounts.length) return <div className="bank-surface p-8 text-slate-500">No active account is available.</div>;

  return (
    <>
      <MoneyOperationCard
        eyebrow="Send money"
        title="Transfer to another account"
        description="We email a 6-digit OTP before money leaves your account. The OTP is tied to this exact sender, recipient and amount."
        accounts={accounts}
        selected={selected}
        onSelected={setSelected}
        recipient={recipient}
        onRecipient={setRecipient}
        amount={amount}
        onAmount={setAmount}
        submitLabel="Send OTP & transfer"
        pendingLabel="Sending OTP…"
        pending={status.state === "pending"}
        status={status}
        onSubmit={submit}
        accent="blue"
      />

      <OtpVerificationModal
        open={Boolean(challenge)}
        challengeId={challenge?.challengeId}
        maskedEmail={challenge?.maskedEmail}
        expiresInSeconds={challenge?.expiresInSeconds}
        operationLabel="transfer"
        amountLabel={challenge ? `₹${Number(challenge.payload.amount).toLocaleString("en-IN")}` : ""}
        verifying={verifying}
        resending={resending}
        error={otpError}
        onVerify={verify}
        onResend={() => requestOtp(challenge.payload, true)}
        onClose={() => { setChallenge(null); setOtpError(""); }}
      />
    </>
  );
}
