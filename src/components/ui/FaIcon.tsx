import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons'

interface FaIconProps {
  icon: IconDefinition
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

export function FaIcon({ icon, className, ...props }: FaIconProps) {
  return <FontAwesomeIcon icon={icon} className={className} {...props} />
}
