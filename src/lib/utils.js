export function cn(...inputs) {
  return inputs.flat(Infinity).filter(Boolean).join(' ').trim();
}

export const isIframe =
  typeof window !== 'undefined' ? window.self !== window.top : false;
