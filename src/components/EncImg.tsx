import { useMedia } from '../lib/useMedia'

interface Props {
  path: string
  className?: string
  alt?: string
}

/** Renders a possibly-encrypted image; shows a neutral placeholder until decrypted. */
export default function EncImg({ path, className, alt = '' }: Props) {
  const url = useMedia(path)
  if (!url) return <span className={'encimg-loading' + (className ? ` ${className}` : '')} aria-hidden="true" />
  return <img className={(className ? `${className} ` : '') + 'encimg-ready'} src={url} alt={alt} decoding="async" />
}
