import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderRoute } from '../test/render'
import { expect, test } from '../test/browserTest'

test('submits with Enter and returns focus to the input', async () => {
  renderRoute('/todos')

  await screen.findByText('Buy milk')

  const input = screen.getByRole('textbox', { name: 'New todo' })
  await userEvent.type(input, 'Hello{Enter}')

  await screen.findByText('Hello')
  await expect(input).toHaveValue('')
  await expect(input).toHaveFocus()
})
