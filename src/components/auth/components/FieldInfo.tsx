import type { AnyFieldApi } from '@tanstack/react-form';

export function FieldInfo({ field, id }: { field: AnyFieldApi; id?: string }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <p id={id} className="text-xs text-destructive" role="alert" aria-live="polite">
          {field.state.meta.errors.map((err) => err.message).join('. ')}
        </p>
      ) : null}
    </>
  );
}
