type IconProps = { size?: number };

export function YoutubeIcon({ size = 24 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.7" /><path d="m10 9 5 3-5 3V9Z" fill="currentColor" /></svg>;
}

export function InstagramIcon({ size = 24 }: IconProps) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" /><circle cx="17.5" cy="6.7" r="1.1" fill="currentColor" /></svg>;
}
