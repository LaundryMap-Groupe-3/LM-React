export const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/;

export const getStrongPasswordRules = (t) => ({
  required: t('validation.password_required'),
  minLength: {
    value: 12,
    message: t('validation.password_too_short'),
  },
  pattern: {
    value: STRONG_PASSWORD_REGEX,
    message: t('validation.password_weak'),
  },
});
