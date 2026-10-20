/**
 * Progressive enhancement: content remains readable before hydration and
 * when reduced motion is preferred. IntersectionObserver only changes
 * presentation; no navigation or data relies on it.
 */
export function useRevealOnScroll() {
  let observer: IntersectionObserver | undefined

  onMounted(() => {
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return

    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!elements.length) return

    document.documentElement.classList.add('motion-ready')
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-visible')
        observer?.unobserve(entry.target)
      }
    }, { threshold: 0.08, rootMargin: '0px 0px 50px 0px' })
    elements.forEach((element) => observer?.observe(element))
  })

  onUnmounted(() => {
    observer?.disconnect()
    document.documentElement.classList.remove('motion-ready')
  })
}
