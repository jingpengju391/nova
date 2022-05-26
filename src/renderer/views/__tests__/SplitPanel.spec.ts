import { mount } from '@vue/test-utils'
import SplitPanel from '../SplitPanel.vue'

describe('SplitPanel.vue', () => {
  it('renders props.splitDirection when passed', () => {
    const splitDirection = 'vertical'
    const wrapper = mount(SplitPanel, {
      propsData: { splitDirection }
    })
    expect(wrapper.props().splitDirection).toBe('vertical')
  })
  it('renders horizontal when no props.splitDirection passed', () => {
    const wrapper = mount(SplitPanel)
    expect(wrapper.props().splitDirection).toBe('horizontal')
  })
})
