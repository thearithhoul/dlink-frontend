import { beforeEach, describe, it, expect } from 'vitest'

import { flushPromises, mount } from '@vue/test-utils'
import App from '../App.vue'
import router from '../router'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders landing page content', async () => {
    await router.push('/')
    await router.isReady()

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('One place for all your most important links.')
  })

  it('renders dashboard page content', async () => {
    await router.push('/dashboard')

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('All Links Lists')
  })

  it('shows dashboard action on landing when already signed in', async () => {
    localStorage.setItem('access_token', 'sample-token')

    await router.push('/')

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Open Dashboard')
    expect(wrapper.text()).toContain('Dashboard')
    expect(wrapper.text()).not.toContain('Sign In')
  })

  it('redirects signed-in users away from sign in', async () => {
    localStorage.setItem('access_token', 'sample-token')

    await router.push('/signin')

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    expect(router.currentRoute.value.name).toBe('dashboard')
    expect(wrapper.text()).toContain('All Links Lists')
  })

  it('logs out from dashboard and returns to landing', async () => {
    localStorage.setItem('access_token', 'sample-token')

    await router.push('/dashboard')

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    })

    const logoutButton = wrapper.findAll('button').find((button) => button.text() === 'Logout')

    expect(logoutButton).toBeDefined()

    if (!logoutButton) {
      return
    }

    await logoutButton.trigger('click')
    await flushPromises()

    expect(localStorage.getItem('access_token')).toBeNull()
    expect(router.currentRoute.value.name).toBe('landing')
    expect(wrapper.text()).toContain('One place for all your most important links.')
  })
})
