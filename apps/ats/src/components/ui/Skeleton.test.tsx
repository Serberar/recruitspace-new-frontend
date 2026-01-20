import { describe, it, expect } from 'vitest'
import { render } from '../../test/test-utils'
import {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonCard,
  SkeletonTable,
} from './Skeleton'

describe('Skeleton', () => {
  describe('Variants', () => {
    it('renders text variant by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('text')
    })

    it('renders circular variant', () => {
      const { container } = render(<Skeleton variant="circular" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('circular')
    })

    it('renders rectangular variant', () => {
      const { container } = render(<Skeleton variant="rectangular" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('rectangular')
    })

    it('renders rounded variant', () => {
      const { container } = render(<Skeleton variant="rounded" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('rounded')
    })
  })

  describe('Dimensions', () => {
    it('applies width as number (px)', () => {
      const { container } = render(<Skeleton width={100} />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.width).toBe('100px')
    })

    it('applies width as string', () => {
      const { container } = render(<Skeleton width="50%" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.width).toBe('50%')
    })

    it('applies height as number (px)', () => {
      const { container } = render(<Skeleton height={50} />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.height).toBe('50px')
    })

    it('applies height as string', () => {
      const { container } = render(<Skeleton height="2rem" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.style.height).toBe('2rem')
    })
  })

  describe('Multiple lines', () => {
    it('renders single line by default', () => {
      const { container } = render(<Skeleton variant="text" />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBe(1)
    })

    it('renders multiple lines when lines > 1', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      expect(skeletons.length).toBe(3)
    })

    it('makes last line shorter (80%)', () => {
      const { container } = render(<Skeleton variant="text" lines={3} />)
      const skeletons = container.querySelectorAll('[class*="skeleton"]')
      const lastSkeleton = skeletons[2] as HTMLElement
      expect(lastSkeleton.style.width).toBe('80%')
    })
  })

  describe('Animation', () => {
    it('applies pulse animation by default', () => {
      const { container } = render(<Skeleton />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('pulse')
    })

    it('applies wave animation', () => {
      const { container } = render(<Skeleton animation="wave" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('wave')
    })

    it('applies no animation', () => {
      const { container } = render(<Skeleton animation="none" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('none')
    })
  })

  describe('Custom className', () => {
    it('applies custom className', () => {
      const { container } = render(<Skeleton className="custom-skeleton" />)
      const skeleton = container.firstChild as HTMLElement
      expect(skeleton.className).toContain('custom-skeleton')
    })
  })
})

describe('SkeletonText', () => {
  it('renders 3 lines by default', () => {
    const { container } = render(<SkeletonText />)
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBe(3)
  })

  it('renders specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />)
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBe(5)
  })

  it('applies width when provided', () => {
    const { container } = render(<SkeletonText width="200px" />)
    const skeleton = container.querySelector('[class*="skeleton"]') as HTMLElement
    expect(skeleton.style.width).toBe('200px')
  })
})

describe('SkeletonAvatar', () => {
  it('renders circular skeleton', () => {
    const { container } = render(<SkeletonAvatar />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.className).toContain('circular')
  })

  it('renders with default size 40', () => {
    const { container } = render(<SkeletonAvatar />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe('40px')
    expect(skeleton.style.height).toBe('40px')
  })

  it('renders with custom size', () => {
    const { container } = render(<SkeletonAvatar size={60} />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe('60px')
    expect(skeleton.style.height).toBe('60px')
  })
})

describe('SkeletonButton', () => {
  it('renders rounded skeleton', () => {
    const { container } = render(<SkeletonButton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.className).toContain('rounded')
  })

  it('renders with default dimensions', () => {
    const { container } = render(<SkeletonButton />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe('100px')
    expect(skeleton.style.height).toBe('36px')
  })

  it('renders with custom dimensions', () => {
    const { container } = render(<SkeletonButton width={150} height={48} />)
    const skeleton = container.firstChild as HTMLElement
    expect(skeleton.style.width).toBe('150px')
    expect(skeleton.style.height).toBe('48px')
  })
})

describe('SkeletonCard', () => {
  it('renders card skeleton with multiple parts', () => {
    const { container } = render(<SkeletonCard />)
    const skeletons = container.querySelectorAll('[class*="skeleton"]')
    expect(skeletons.length).toBeGreaterThan(1)
  })

  it('includes rectangular skeleton for image area', () => {
    const { container } = render(<SkeletonCard />)
    const skeleton = container.querySelector('[class*="rectangular"]')
    expect(skeleton).toBeInTheDocument()
  })

  it('includes text skeletons for content', () => {
    const { container } = render(<SkeletonCard />)
    const textSkeletons = container.querySelectorAll('[class*="text"]')
    expect(textSkeletons.length).toBeGreaterThan(0)
  })
})

describe('SkeletonTable', () => {
  it('renders 5 rows by default', () => {
    const { container } = render(<SkeletonTable />)
    const rows = container.querySelectorAll('[class*="tableRow"]')
    expect(rows.length).toBe(5)
  })

  it('renders custom number of rows', () => {
    const { container } = render(<SkeletonTable rows={3} />)
    const rows = container.querySelectorAll('[class*="tableRow"]')
    expect(rows.length).toBe(3)
  })

  it('renders 4 columns by default', () => {
    const { container } = render(<SkeletonTable />)
    const headerCells = container.querySelectorAll('[class*="tableHeader"] [class*="skeleton"]')
    expect(headerCells.length).toBe(4)
  })

  it('renders custom number of columns', () => {
    const { container } = render(<SkeletonTable columns={6} />)
    const headerCells = container.querySelectorAll('[class*="tableHeader"] [class*="skeleton"]')
    expect(headerCells.length).toBe(6)
  })

  it('renders header row', () => {
    const { container } = render(<SkeletonTable />)
    const header = container.querySelector('[class*="tableHeader"]')
    expect(header).toBeInTheDocument()
  })
})
