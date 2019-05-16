import React from 'react';
import { mount } from 'enzyme';
import { ColumnsToTabs, ColumnTab } from './ColumnsToTabs';

function setup() {
  return (
    <ColumnsToTabs tabBreakpoint={991}>
      <ColumnTab label="Column 1">
        <div className="column-tab-1" />
      </ColumnTab>
      <ColumnTab label="Column 2">
        <div className="column-tab-2" />
      </ColumnTab>
      <ColumnTab label="Column 3">
        <div className="column-tab-3" />
      </ColumnTab>
    </ColumnsToTabs>
  );
}

function setMatchMedia(bool) {
  window.matchMedia = jest.fn(() => ({ matches: bool }));
}

beforeAll(() => {
  setMatchMedia(false);
});

describe('columns', () => {
  it('renders as columns', () => {
    const component = setup();
    const wrapper = mount(component);
    expect(wrapper.find('.columns')).toExist();
  });

  it('renders the 3 columns', () => {
    const component = setup();
    const wrapper = mount(component);
    expect(wrapper.find(ColumnTab)).toHaveLength(3);
    expect(wrapper.find('.column-tab-1')).toHaveLength(1);
    expect(wrapper.find('.column-tab-2')).toHaveLength(1);
    expect(wrapper.find('.column-tab-3')).toHaveLength(1);
  });
});

function hasClass(wrapper, className) {
  console.log(wrapper
    .prop('className')
    .split(' '));
  return wrapper
    .prop('className')
    .split(' ')
    .indexOf(className) >= 0;
}

describe('tabs', () => {
  beforeAll(() => {
    setMatchMedia(true);
  });

  it('renders as tabs', () => {
    const component = setup();
    const wrapper = mount(component);
    expect(wrapper.find('.tabs')).toExist();
  });

  it('renders the 3 tabs', () => {
    const component = setup();
    const wrapper = mount(component);
    expect(wrapper.find(ColumnTab)).toHaveLength(3);
    expect(wrapper.find('.column-tab-1')).toHaveLength(1);
    expect(wrapper.find('.column-tab-2')).toHaveLength(1);
    expect(wrapper.find('.column-tab-3')).toHaveLength(1);
  });

  it('sets first tab nav button as active', () => {
    const component = setup();
    const wrapper = mount(component);

    expect(hasClass(wrapper.find('.tab-navigation button').first(), 'active'))
      .toEqual(true);
  });

  it('sets first tab as active', () => {
    const component = setup();
    const wrapper = mount(component);

    expect(hasClass(wrapper.find('.column-tab').first(), 'active'))
      .toEqual(true);
  });

  it('sets clicked tab nav as active', () => {
    const component = setup();
    const wrapper = mount(component);

    wrapper.find('.tab-navigation button').at(1).simulate('click');

    expect(hasClass(wrapper.find('div.column-tab').at(1), 'active'))
      .toEqual(true);

    expect(hasClass(wrapper.find('.tab-navigation button').at(1), 'active'))
      .toEqual(true);
  });

  it('sets only one tab as active', () => {
    const component = setup();
    const wrapper = mount(component);

    wrapper.find('.tab-navigation button').at(1).simulate('click');

    expect(wrapper.find('div.column-tab.active')).toHaveLength(1);
    expect(wrapper.find('.tab-navigation button.active')).toHaveLength(1);
  });
});
