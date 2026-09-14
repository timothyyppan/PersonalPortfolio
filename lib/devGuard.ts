export function isAdminEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}
