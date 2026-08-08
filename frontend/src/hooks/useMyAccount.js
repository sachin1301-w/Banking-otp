import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../auth/AuthContext";
import { usersApi, accountsApi } from "../api/services";

export function useMyAccount() {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: null, profile: null, accounts: [] });

  const reload = useCallback(async () => {
    if (!user) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const [profile, accounts] = await Promise.all([usersApi.me(), accountsApi.me()]);
      setState({ loading: false, error: null, profile, accounts });
    } catch (err) {
      setState({
        loading: false,
        error: err.response?.data?.message || "Could not load your banking details.",
        profile: null,
        accounts: [],
      });
    }
  }, [user]);

  useEffect(() => { reload(); }, [reload]);
  return { ...state, reload };
}
