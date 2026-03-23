/**
 * Icon re-exports — ElevenLabs standard: Lucide React, strokeWidth 1.5
 * All names preserved so existing consumers require zero changes.
 */
import type { LucideProps } from 'lucide-react'
import {
  LogOut, ArrowRight, Bell, BarChart2, User, Clock, Mail, Flame,
  LayoutGrid, Home, Search, Shield, Tag, Trash2, AlertCircle,
  RefreshCw, Clipboard, List, Share2, ExternalLink, ChevronDown,
  ChevronRight, Plus, Check, X, Settings, MoreHorizontal, Loader2,
  Info, Copy, Globe, Code, TrendingDown, TrendingUp, Minus, HelpCircle,
} from 'lucide-react'

const DEFAULT_STROKE = 1.5

function withStroke(Icon: React.ElementType) {
  return function StyledIcon({ strokeWidth = DEFAULT_STROKE, ...props }: LucideProps) {
    return <Icon strokeWidth={strokeWidth} {...props} />
  }
}

export const IconLogOut       = withStroke(LogOut)
export const IconArrowRight   = withStroke(ArrowRight)
export const IconBell         = withStroke(Bell)
export const IconChart        = withStroke(BarChart2)
export const IconUser         = withStroke(User)
export const IconClock        = withStroke(Clock)
export const IconMail         = withStroke(Mail)
export const IconFire         = withStroke(Flame)
export const IconGrid         = withStroke(LayoutGrid)
export const IconHouse        = withStroke(Home)
export const IconSearch       = withStroke(Search)
export const IconShield       = withStroke(Shield)
export const IconTag          = withStroke(Tag)
export const IconTrash        = withStroke(Trash2)
export const IconAlert        = withStroke(AlertCircle)
export const IconRefresh      = withStroke(RefreshCw)
export const IconClipboard    = withStroke(Clipboard)
export const IconList         = withStroke(List)
export const IconShare        = withStroke(Share2)
export const IconExternal     = withStroke(ExternalLink)
export const IconChevronDown  = withStroke(ChevronDown)
export const IconChevronRight = withStroke(ChevronRight)
export const IconPlus         = withStroke(Plus)
export const IconCheck        = withStroke(Check)
export const IconClose        = withStroke(X)
export const IconSettings     = withStroke(Settings)
export const IconMore         = withStroke(MoreHorizontal)
export const IconLoader       = withStroke(Loader2)
export const IconInfo         = withStroke(Info)
export const IconCopy         = withStroke(Copy)
export const IconGlobe        = withStroke(Globe)
export const IconCode         = withStroke(Code)
export const IconTrendDown    = withStroke(TrendingDown)
export const IconTrendUp      = withStroke(TrendingUp)
export const IconMinus        = withStroke(Minus)
export const IconHelp         = withStroke(HelpCircle)

export {
  LogOut, ArrowRight, Bell, BarChart2, User, Clock, Mail, Flame,
  LayoutGrid, Home, Search, Shield, Tag, Trash2, AlertCircle,
  RefreshCw, Clipboard, List, Share2, ExternalLink, ChevronDown,
  ChevronRight, Plus, Check, X, Settings, MoreHorizontal, Loader2,
  Info, Copy, Globe, Code, TrendingDown, TrendingUp, Minus, HelpCircle,
}
