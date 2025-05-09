import { useState } from 'react';

interface PromptFormState {
  prompt: string;
  isValid: boolean;
  error: string | null;
}

export function usePromptForm(onSubmit: (prompt: string) => Promise<void>) {
  const [state, setState] = useState<PromptFormState>({
    prompt: '',
    isValid: false,
    error: null,
  });

  const validatePrompt = (prompt: string) => {
    const trimmedPrompt = prompt.trim();
    const isValid = trimmedPrompt.length >= 10;
    const error = isValid ? null : 'Prompt powinien zawierać co najmniej 10 znaków';
    return { isValid, error };
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const prompt = e.target.value;
    const { isValid, error } = validatePrompt(prompt);
    setState({ prompt, isValid, error });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, error } = validatePrompt(state.prompt);
    if (!isValid) {
      setState((prev) => ({ ...prev, error }));
      return;
    }

    await onSubmit(state.prompt);
  };

  return {
    state,
    handleChange,
    handleSubmit,
  };
}
