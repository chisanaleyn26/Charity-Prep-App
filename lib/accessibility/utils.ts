// Accessibility utilities and helpers

// Screen reader announcements
export class ScreenReaderAnnouncer {
  private announcer: HTMLElement | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      this.createAnnouncer()
    }
  }

  private createAnnouncer() {
    if (this.announcer) return

    this.announcer = document.createElement('div')
    this.announcer.setAttribute('aria-live', 'polite')
    this.announcer.setAttribute('aria-atomic', 'true')
    this.announcer.className = 'sr-only'
    this.announcer.style.cssText = `
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    `
    document.body.appendChild(this.announcer)
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (!this.announcer) this.createAnnouncer()
    if (!this.announcer) return

    this.announcer.setAttribute('aria-live', priority)
    this.announcer.textContent = message

    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      if (this.announcer) {
        this.announcer.textContent = ''
      }
    }, 1000)
  }
}

// Global announcer instance
export const announcer = new ScreenReaderAnnouncer()

// Keyboard navigation utilities
export class KeyboardNavigation {
  static readonly KEYS = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    TAB: 'Tab',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
  } as const

  // Handle roving tabindex for component groups
  static setupRovingTabindex(
    container: HTMLElement,
    selector: string = '[role="button"], button, [role="menuitem"], [role="option"]'
  ) {
    const items = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    if (items.length === 0) return

    // Set initial tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1')
    })

    // Add keyboard event listeners
    items.forEach((item, index) => {
      item.addEventListener('keydown', (event) => {
        let targetIndex = index

        switch (event.key) {
          case this.KEYS.ARROW_DOWN:
          case this.KEYS.ARROW_RIGHT:
            targetIndex = (index + 1) % items.length
            break
          case this.KEYS.ARROW_UP:
          case this.KEYS.ARROW_LEFT:
            targetIndex = (index - 1 + items.length) % items.length
            break
          case this.KEYS.HOME:
            targetIndex = 0
            break
          case this.KEYS.END:
            targetIndex = items.length - 1
            break
          default:
            return
        }

        event.preventDefault()
        this.moveFocus(items, targetIndex)
      })
    })
  }

  private static moveFocus(items: HTMLElement[], targetIndex: number) {
    // Update tabindex
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === targetIndex ? '0' : '-1')
    })

    // Focus the target item
    items[targetIndex]?.focus()
  }

  // Trap focus within a container (useful for modals)
  static trapFocus(container: HTMLElement, returnFocus?: HTMLElement) {
    const focusableSelector = `
      a[href],
      button:not([disabled]),
      input:not([disabled]),
      select:not([disabled]),
      textarea:not([disabled]),
      [tabindex]:not([tabindex="-1"]),
      [contenteditable="true"]
    `

    const focusableElements = Array.from(
      container.querySelectorAll(focusableSelector)
    ) as HTMLElement[]

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    // Focus first element
    firstElement.focus()

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key !== this.KEYS.TAB) return

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeydown)

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeydown)
      if (returnFocus) {
        returnFocus.focus()
      }
    }
  }
}

// Focus management utilities
export class FocusManager {
  private static focusHistory: HTMLElement[] = []

  // Save current focus for later restoration
  static saveFocus() {
    const activeElement = document.activeElement as HTMLElement
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement)
    }
  }

  // Restore previously saved focus
  static restoreFocus() {
    const lastFocused = this.focusHistory.pop()
    if (lastFocused && document.contains(lastFocused)) {
      lastFocused.focus()
      return true
    }
    return false
  }

  // Move focus to element and announce it
  static moveTo(element: HTMLElement | null, announce?: string) {
    if (!element) return false

    element.focus()
    
    if (announce) {
      announcer.announce(announce)
    }

    return true
  }

  // Find next focusable element
  static findNextFocusable(current: HTMLElement, forward: boolean = true): HTMLElement | null {
    const focusableSelector = `
      a[href]:not([disabled]):not([aria-hidden="true"]),
      button:not([disabled]):not([aria-hidden="true"]),
      input:not([disabled]):not([aria-hidden="true"]),
      select:not([disabled]):not([aria-hidden="true"]),
      textarea:not([disabled]):not([aria-hidden="true"]),
      [tabindex]:not([tabindex="-1"]):not([aria-hidden="true"])
    `

    const focusableElements = Array.from(
      document.querySelectorAll(focusableSelector)
    ) as HTMLElement[]

    const currentIndex = focusableElements.indexOf(current)
    if (currentIndex === -1) return null

    const nextIndex = forward 
      ? (currentIndex + 1) % focusableElements.length
      : (currentIndex - 1 + focusableElements.length) % focusableElements.length

    return focusableElements[nextIndex] || null
  }
}

// ARIA utilities
export class AriaUtils {
  // Generate unique IDs for ARIA relationships
  static generateId(prefix: string = 'aria'): string {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Set up ARIA relationships between elements
  static connectElements(
    control: HTMLElement,
    target: HTMLElement,
    relationship: 'describedby' | 'labelledby' | 'controls' | 'owns'
  ) {
    let targetId = target.id
    if (!targetId) {
      targetId = this.generateId(relationship)
      target.id = targetId
    }

    const existingValue = control.getAttribute(`aria-${relationship}`)
    const newValue = existingValue 
      ? `${existingValue} ${targetId}`
      : targetId

    control.setAttribute(`aria-${relationship}`, newValue)
  }

  // Update ARIA live region
  static announceToLiveRegion(message: string, regionId?: string) {
    let region = regionId 
      ? document.getElementById(regionId)
      : document.querySelector('[aria-live]')

    if (!region) {
      // Create a default live region
      region = document.createElement('div')
      region.setAttribute('aria-live', 'polite')
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      region.style.cssText = `
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
      `
      document.body.appendChild(region)
    }

    region.textContent = message
  }

  // Set ARIA expanded state and announce it
  static setExpanded(element: HTMLElement, expanded: boolean, announce?: boolean) {
    element.setAttribute('aria-expanded', expanded.toString())
    
    if (announce) {
      const message = expanded ? 'Expanded' : 'Collapsed'
      announcer.announce(message)
    }
  }

  // Set ARIA selected state
  static setSelected(element: HTMLElement, selected: boolean, announce?: boolean) {
    element.setAttribute('aria-selected', selected.toString())
    
    if (announce && selected) {
      const label = element.textContent || element.getAttribute('aria-label') || 'Item'
      announcer.announce(`${label} selected`)
    }
  }

  // Set ARIA pressed state for toggle buttons
  static setPressed(element: HTMLElement, pressed: boolean, announce?: boolean) {
    element.setAttribute('aria-pressed', pressed.toString())
    
    if (announce) {
      const action = pressed ? 'activated' : 'deactivated'
      const label = element.textContent || element.getAttribute('aria-label') || 'Button'
      announcer.announce(`${label} ${action}`)
    }
  }
}

// Form accessibility helpers
export class FormAccessibility {
  // Add ARIA error messages to form fields
  static addFieldError(field: HTMLElement, errorMessage: string) {
    let errorElement = document.getElementById(`${field.id}-error`)
    
    if (!errorElement) {
      errorElement = document.createElement('div')
      errorElement.id = `${field.id}-error`
      errorElement.setAttribute('role', 'alert')
      errorElement.className = 'text-red-600 text-sm mt-1'
      field.parentNode?.insertBefore(errorElement, field.nextSibling)
    }

    errorElement.textContent = errorMessage
    field.setAttribute('aria-invalid', 'true')
    field.setAttribute('aria-describedby', errorElement.id)
    
    // Announce error to screen readers
    announcer.announce(`Error: ${errorMessage}`, 'assertive')
  }

  // Remove error state from field
  static removeFieldError(field: HTMLElement) {
    const errorElement = document.getElementById(`${field.id}-error`)
    if (errorElement) {
      errorElement.remove()
    }
    
    field.removeAttribute('aria-invalid')
    field.removeAttribute('aria-describedby')
  }

  // Add progress indicator for multi-step forms
  static updateFormProgress(
    currentStep: number, 
    totalSteps: number, 
    stepName?: string
  ) {
    const message = stepName 
      ? `Step ${currentStep} of ${totalSteps}: ${stepName}`
      : `Step ${currentStep} of ${totalSteps}`
    
    announcer.announce(message)
  }
}

// Color contrast checker (basic implementation)
export class ColorContrast {
  // Calculate relative luminance
  private static getLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    })
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
  }

  // Calculate contrast ratio between two colors
  static getContrastRatio(color1: string, color2: string): number {
    // Simple hex color parsing (extend as needed)
    const hex1 = color1.replace('#', '')
    const hex2 = color2.replace('#', '')
    
    const r1 = parseInt(hex1.substr(0, 2), 16)
    const g1 = parseInt(hex1.substr(2, 2), 16)
    const b1 = parseInt(hex1.substr(4, 2), 16)
    
    const r2 = parseInt(hex2.substr(0, 2), 16)
    const g2 = parseInt(hex2.substr(2, 2), 16)
    const b2 = parseInt(hex2.substr(4, 2), 16)
    
    const lum1 = this.getLuminance(r1, g1, b1)
    const lum2 = this.getLuminance(r2, g2, b2)
    
    const brightest = Math.max(lum1, lum2)
    const darkest = Math.min(lum1, lum2)
    
    return (brightest + 0.05) / (darkest + 0.05)
  }

  // Check if contrast meets WCAG standards
  static meetsWCAG(
    foreground: string, 
    background: string, 
    level: 'AA' | 'AAA' = 'AA',
    fontSize: 'normal' | 'large' = 'normal'
  ): boolean {
    const ratio = this.getContrastRatio(foreground, background)
    
    if (level === 'AAA') {
      return fontSize === 'large' ? ratio >= 4.5 : ratio >= 7
    } else {
      return fontSize === 'large' ? ratio >= 3 : ratio >= 4.5
    }
  }
}

// Reduced motion utilities
export class MotionPreferences {
  static prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  static setupMotionListener(callback: (prefersReduced: boolean) => void) {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addListener((e) => callback(e.matches))
    
    // Call initially
    callback(mediaQuery.matches)
    
    return () => mediaQuery.removeListener(callback)
  }
}

// Export all utilities
export {
  ScreenReaderAnnouncer,
  KeyboardNavigation,
  FocusManager,
  AriaUtils,
  FormAccessibility,
  ColorContrast,
  MotionPreferences,
}