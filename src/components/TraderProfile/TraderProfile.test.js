import React from 'react';
import { mount } from 'enzyme';
import TraderProfile from './TraderProfile';

jest.mock('../ScoreChart/ScoreChart', () => (
  // eslint-disable-next-line func-names
  function MockScoreChart() {
    return <div />;
  }
));

jest.mock('./TraderInfo', () => (
  // eslint-disable-next-line func-names
  function MockTraderInfo() {
    return <div />;
  }
));

function setup(args) {
  return <TraderProfile {...args} />;
}

describe('score chart', () => {
  it('passes trader', async () => {
    const testTrader = { id: 'test' };
    const component = setup({ trader: testTrader });
    const wrapper = mount(component);
    expect(wrapper.find('MockScoreChart').prop('trader')).toEqual(testTrader);
  });
});

describe('trader info', () => {
  it('passes trader', async () => {
    const testTrader = { id: 'test' };
    const component = setup({ trader: testTrader });
    const wrapper = mount(component);
    expect(wrapper.find('MockTraderInfo').prop('trader')).toEqual(testTrader);
  });
});
