import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it } from 'vitest'
import { renderRoute } from '../test/render'

describe('todos route', () => {
  it('loads todos and adds a new todo', async () => {
    renderRoute('/todos')

    await screen.findByText('Buy milk')

    const input = screen.getByRole('textbox', { name: 'New todo' })
    await userEvent.type(input, 'Write docs')
    await userEvent.click(screen.getByRole('button', { name: 'Add' }))

    await screen.findByText('Write docs')
  })
})
