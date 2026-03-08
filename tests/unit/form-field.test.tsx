/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { FormField } from '@/components/forms/form-field'
import { Input } from '@/components/ui/input'

describe('FormField Component', () => {
  it('renders label correctly', () => {
    render(
      <FormField label="Test Label" id="test">
        <Input id="test" />
      </FormField>
    )
    expect(screen.getByText('Test Label')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(
      <FormField label="Test" error="This is an error" id="test">
        <Input id="test" />
      </FormField>
    )
    expect(screen.getByText('This is an error')).toBeInTheDocument()
    expect(screen.getByText('This is an error')).toHaveAttribute('role', 'alert')
  })

  it('does not render error when empty', () => {
    render(
      <FormField label="Test" error={null} id="test">
        <Input id="test" />
      </FormField>
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders description when provided', () => {
    render(
      <FormField label="Test" description="This is a description" id="test">
        <Input id="test" />
      </FormField>
    )
    expect(screen.getByText('This is a description')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FormField label="Test" className="custom-class" id="test">
        <Input id="test" />
      </FormField>
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>()
    render(
      <FormField label="Test" ref={ref} id="test">
        <Input id="test" />
      </FormField>
    )
    expect(ref.current).toBeInTheDocument()
  })
})
